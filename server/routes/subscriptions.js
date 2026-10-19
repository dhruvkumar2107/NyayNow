const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const verifyToken = require("../middleware/authMiddleware");
const User = require("../models/User");
const Payment = require("../models/Payment");
const { verifySignature } = require("../services/paymentService");
const {
  SUBSCRIPTION_PLANS: PLAN_CONFIG,
  LISTING_CONFIG,
  CREDIT_PACKS,
} = require("../config/plans");

const razorpay = process.env.RZP_KEY_ID
  ? new Razorpay({ key_id: process.env.RZP_KEY_ID, key_secret: process.env.RZP_KEY_SECRET })
  : null;

// Plan / listing / credit catalogues are defined once in server/config/plans.js
// (single source of truth shared with the one-time payments route).

const YEARLY_DAYS = 365;
const MONTHLY_DAYS = 30;

/**
 * Verify signature AND fetch the authoritative order from Razorpay so the
 * amount/plan can never be trusted from the client body.
 * Throws {status, message} on failure.
 */
async function fetchVerifiedOrder(razorpayInstance, orderId, paymentId, signature) {
  if (!verifySignature(orderId, paymentId, signature)) {
    throw { status: 400, message: "Invalid payment signature" };
  }
  let order;
  try {
    order = await razorpayInstance.orders.fetch(orderId);
  } catch (e) {
    throw { status: 400, message: "Could not verify order with payment provider" };
  }
  if (!order) throw { status: 400, message: "Order not found" };
  return order;
}

/** Returns true when this paymentId has already been applied (replay guard). */
async function alreadyProcessed(paymentId) {
  return !!(await Payment.findOne({ paymentId }));
}

// ─── GET SUBSCRIPTION STATUS ──────────────────────────────────────────────────
router.get("/status", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("plan credits aiUsage listingTier subscriptionId subscriptionStatus subscriptionEndDate featureUsage");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      plan: user.plan,
      credits: user.credits || 0,
      aiUsage: user.aiUsage,
      featureUsage: user.featureUsage || {},
      listingTier: user.listingTier,
      subscriptionId: user.subscriptionId || null,
      subscriptionStatus: user.subscriptionStatus || "inactive",
      subscriptionEndDate: user.subscriptionEndDate || null,
      isActive: ["pro", "firm", "silver", "gold", "diamond"].includes(user.plan)
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get subscription status" });
  }
});

// ─── CREATE RECURRING SUBSCRIPTION ORDER ──────────────────────────────────────
router.post("/create-subscription", verifyToken, async (req, res) => {
  try {
    const { plan, billing = "monthly" } = req.body;

    if (!PLAN_CONFIG[plan]) {
      return res.status(400).json({ error: "Invalid plan. Choose 'pro', 'gold', or 'firm'" });
    }

    if (!razorpay) {
      return res.status(500).json({ error: "Payment gateway not configured" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const config = PLAN_CONFIG[plan];
    const billingKey = billing === "yearly" ? "yearly" : "monthly";
    const amount = typeof config.amount === "object" ? config.amount[billingKey] : config.amount;

    // Create a Razorpay order
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `sub_${plan}_${billingKey}_${req.userId.substring(0, 8)}_${Date.now()}`,
      notes: {
        plan,
        billing: billingKey,
        userId: req.userId,
        email: user.email,
        type: "subscription"
      }
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RZP_KEY_ID,
      plan,
      billing: billingKey,
      planConfig: { ...config, amount },
      user: { name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("Create subscription error:", err.message);
    res.status(500).json({ error: "Failed to create subscription order" });
  }
});

// ─── VERIFY SUBSCRIPTION PAYMENT ─────────────────────────────────────────────
router.post("/verify-subscription", verifyToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment verification fields" });
    }
    if (!razorpay) return res.status(500).json({ error: "Payment gateway not configured" });

    // Replay/idempotency guard
    if (await alreadyProcessed(razorpay_payment_id)) {
      return res.json({ success: true, message: "Payment already processed" });
    }

    // Fetch authoritative order (validates signature + amount + notes server-side)
    const order = await fetchVerifiedOrder(razorpay, razorpay_order_id, razorpay_payment_id, razorpay_signature);
    const notes = order.notes || {};

    if (notes.userId !== req.userId) {
      return res.status(403).json({ error: "Order does not belong to this user" });
    }

    const plan = notes.plan;
    const billing = notes.billing === "yearly" ? "yearly" : "monthly";
    const config = PLAN_CONFIG[plan];
    if (!config) return res.status(400).json({ error: "Invalid plan" });

    const expectedAmount = typeof config.amount === "object" ? config.amount[billing] : config.amount;
    if (order.amount !== expectedAmount) {
      return res.status(400).json({ error: "Amount mismatch for plan" });
    }

    // Compute end date from the actual billing period (monthly=30d, yearly=365d)
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + (billing === "yearly" ? YEARLY_DAYS : MONTHLY_DAYS));

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        plan: plan,
        subscriptionStatus: "active",
        subscriptionEndDate,
        lastPaymentId: razorpay_payment_id
      },
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    await Payment.create({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      user: updatedUser._id,
      amount: expectedAmount / 100,
      plan: `subscription_${plan}`,
      status: "success"
    });

    res.json({
      success: true,
      plan: updatedUser.plan,
      billing,
      subscriptionEndDate: updatedUser.subscriptionEndDate,
      message: `Successfully upgraded to ${plan.toUpperCase()} plan! Welcome aboard.`
    });
  } catch (err) {
    if (err && err.status) return res.status(err.status).json({ error: err.message });
    console.error("Verify subscription error:", err.message);
    res.status(500).json({ error: "Subscription verification failed" });
  }
});

// ─── CANCEL SUBSCRIPTION ──────────────────────────────────────────────────────
router.post("/cancel", verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { subscriptionStatus: "cancelled" },
      { new: true }
    );
    // Plan remains active until subscriptionEndDate
    res.json({ success: true, message: "Subscription cancelled. Active until end of billing period.", endDate: user.subscriptionEndDate });
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
});

// ─── UPGRADE LAWYER LISTING TIER ──────────────────────────────────────────────
router.post("/upgrade-listing", verifyToken, async (req, res) => {
  try {
    const { tier } = req.body; // 'standard' or 'premium'

    if (!LISTING_CONFIG[tier]) {
      return res.status(400).json({ error: "Invalid listing tier. Choose 'standard' or 'premium'" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role !== "lawyer") return res.status(403).json({ error: "Only lawyers can upgrade listings" });

    if (!razorpay) return res.status(500).json({ error: "Payment gateway not configured" });

    const config = LISTING_CONFIG[tier];

    const order = await razorpay.orders.create({
      amount: config.amount,
      currency: "INR",
      receipt: `listing_${tier}_${req.userId.substring(0, 8)}_${Date.now()}`,
      notes: {
        tier,
        userId: req.userId,
        type: "listing_upgrade"
      }
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RZP_KEY_ID,
      tier,
      config,
      user: { name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("Listing upgrade error:", err.message);
    res.status(500).json({ error: "Failed to create listing upgrade order" });
  }
});

// ─── VERIFY LISTING UPGRADE ───────────────────────────────────────────────────
router.post("/verify-listing", verifyToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment verification fields" });
    }
    if (!razorpay) return res.status(500).json({ error: "Payment gateway not configured" });

    if (await alreadyProcessed(razorpay_payment_id)) {
      return res.json({ success: true, message: "Payment already processed" });
    }

    const order = await fetchVerifiedOrder(razorpay, razorpay_order_id, razorpay_payment_id, razorpay_signature);
    const notes = order.notes || {};
    if (notes.userId !== req.userId) return res.status(403).json({ error: "Order does not belong to this user" });
    if (notes.type !== "listing_upgrade") return res.status(400).json({ error: "Order is not a listing upgrade" });

    const tier = notes.tier;
    const config = LISTING_CONFIG[tier];
    if (!config) return res.status(400).json({ error: "Invalid listing tier" });
    if (order.amount !== config.amount) return res.status(400).json({ error: "Amount mismatch for listing tier" });

    const listingEndDate = new Date();
    listingEndDate.setDate(listingEndDate.getDate() + MONTHLY_DAYS);

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        listingTier: tier,
        isFeatured: tier === "premium",
        listingEndDate
      },
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    await Payment.create({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      user: updatedUser._id,
      amount: config.amount / 100,
      plan: `listing_${tier}`,
      status: "success"
    });

    res.json({
      success: true,
      listingTier: updatedUser.listingTier,
      isFeatured: updatedUser.isFeatured,
      listingEndDate: updatedUser.listingEndDate,
      message: `Listing upgraded to ${tier.toUpperCase()}! Your profile will now appear at the top.`
    });
  } catch (err) {
    if (err && err.status) return res.status(err.status).json({ error: err.message });
    console.error("Verify listing error:", err.message);
    res.status(500).json({ error: "Listing upgrade verification failed" });
  }
});

// ─── BUY CREDIT PACK ─────────────────────────────────────────────────────────
router.post("/buy-credits", verifyToken, async (req, res) => {
  try {
    const { pack } = req.body;
    const selected = CREDIT_PACKS[pack];
    if (!selected) return res.status(400).json({ error: "Invalid credit pack" });
    if (!razorpay) return res.status(500).json({ error: "Payment gateway not configured" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const order = await razorpay.orders.create({
      amount: selected.amountPaise,
      currency: "INR",
      receipt: `credits_${pack}_${req.userId.substring(0, 8)}_${Date.now()}`,
      notes: { pack, credits: selected.credits, userId: req.userId, type: "credits" }
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RZP_KEY_ID,
      pack: { credits: selected.credits, amount: selected.amountPaise, label: selected.label },
      user: { name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to create credit order" });
  }
});

// ─── VERIFY CREDIT PURCHASE ───────────────────────────────────────────────────
router.post("/verify-credits", verifyToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment verification fields" });
    }
    if (!razorpay) return res.status(500).json({ error: "Payment gateway not configured" });

    if (await alreadyProcessed(razorpay_payment_id)) {
      const existing = await User.findById(req.userId).select("credits");
      return res.json({ success: true, credits: existing?.credits || 0, message: "Payment already processed" });
    }

    const order = await fetchVerifiedOrder(razorpay, razorpay_order_id, razorpay_payment_id, razorpay_signature);
    const notes = order.notes || {};
    if (notes.userId !== req.userId) return res.status(403).json({ error: "Order does not belong to this user" });
    if (notes.type !== "credits") return res.status(400).json({ error: "Order is not a credit purchase" });

    const selected = CREDIT_PACKS[notes.pack];
    if (!selected) return res.status(400).json({ error: "Invalid credit pack" });
    if (order.amount !== selected.amountPaise) return res.status(400).json({ error: "Amount mismatch for credit pack" });

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $inc: { credits: selected.credits } },
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    await Payment.create({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      user: updatedUser._id,
      amount: selected.amountPaise / 100,
      plan: `credits_${notes.pack}`,
      status: "success"
    });

    res.json({
      success: true,
      credits: updatedUser.credits,
      message: `${selected.credits} AI queries added to your account!`
    });
  } catch (err) {
    if (err && err.status) return res.status(err.status).json({ error: err.message });
    console.error("Credit verification error:", err.message);
    res.status(500).json({ error: "Credit verification failed" });
  }
});

// ─── REFERRAL SYSTEM ─────────────────────────────────────────────────────────
router.post("/apply-referral", verifyToken, async (req, res) => {
  try {
    const { referralCode } = req.body;
    if (!referralCode) return res.status(400).json({ error: "Referral code required" });

    // Find referrer
    const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
    if (!referrer) return res.status(404).json({ error: "Invalid referral code" });
    if (referrer._id.toString() === req.userId) return res.status(400).json({ error: "Cannot use your own referral code" });

    // Check not already used
    const currentUser = await User.findById(req.userId);
    if (currentUser.referredBy) return res.status(400).json({ error: "Referral code already applied" });

    // Apply referral: give new user 10 bonus credits
    await User.findByIdAndUpdate(req.userId, {
      referredBy: referrer._id,
      $inc: { credits: 10 }
    });

    // Give referrer 5 bonus credits
    await User.findByIdAndUpdate(referrer._id, {
      $inc: { credits: 5, referralCount: 1 }
    });

    res.json({ success: true, message: "Referral applied! You've received 10 bonus AI queries." });
  } catch (err) {
    res.status(500).json({ error: "Failed to apply referral" });
  }
});

// ─── GET REFERRAL CODE ────────────────────────────────────────────────────────
router.get("/referral", verifyToken, async (req, res) => {
  try {
    let user = await User.findById(req.userId).select("referralCode referralCount name");
    if (!user) return res.status(404).json({ error: "User not found" });

    // Generate referral code if missing
    if (!user.referralCode) {
      const code = user.name.split(" ")[0].toUpperCase().substring(0, 6) + Math.floor(1000 + Math.random() * 9000);
      user = await User.findByIdAndUpdate(req.userId, { referralCode: code }, { new: true }).select("referralCode referralCount name");
    }

    res.json({
      referralCode: user.referralCode,
      referralCount: user.referralCount || 0,
      referralLink: `https://nyaynow.in/register?ref=${user.referralCode}`
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get referral code" });
  }
});

module.exports = router;
