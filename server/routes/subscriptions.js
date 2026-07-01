const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const verifyToken = require("../middleware/authMiddleware");
const User = require("../models/User");
const Payment = require("../models/Payment");

const razorpay = process.env.RZP_KEY_ID
  ? new Razorpay({ key_id: process.env.RZP_KEY_ID, key_secret: process.env.RZP_KEY_SECRET })
  : null;

// ─── PLAN CONFIG ──────────────────────────────────────────────────────────────
const PLAN_CONFIG = {
  pro: {
    name: "Nyay Pro",
    amount: { monthly: 29900, yearly: 249900 }, // ₹299/mo | ₹2499/yr
    period: "monthly",
    interval: 1,
    description: "Unlimited AI queries, Judge AI, Drafting Lab, NyayVoice, FIRAC Research",
    features: ["Unlimited AI Queries", "30 Precedent Searches/mo", "10 Document Drafts/mo", "5 Case PDFs/mo", "NyayVoice 20min/mo", "3 Judge AI Predictions/mo"]
  },
  gold: {
    name: "Nyay Gold",
    amount: { monthly: 79900, yearly: 699900 }, // ₹799/mo | ₹6999/yr
    period: "monthly",
    interval: 1,
    description: "Everything in Pro + Unlimited research, Court-Ready Briefs, Visual Citation Map",
    features: ["Unlimited AI Queries", "Unlimited Precedent Research", "Unlimited Document Drafting", "25 Case PDFs/mo", "Unlimited Judge AI", "Court-Ready Brief Generator", "Visual Precedent Citation Map"]
  },
  firm: {
    name: "Nyay Firm",
    amount: { monthly: 299900, yearly: 2499900 }, // ₹2999/mo | ₹24999/yr
    period: "monthly",
    interval: 1,
    description: "Everything in Gold + Team seats, API access, white-label, Contract Heatmap",
    features: ["Everything in Gold", "10 Team Seats", "Contract Heatmap & Redliner", "AI Witness Cross-Examiner", "API Access (10k calls/mo)", "White-label Reports", "Dedicated Account Manager"]
  }
};

// Lawyer listing upgrade prices
const LISTING_CONFIG = {
  standard: {
    name: "Pro Lawyer Listing",
    amount: 199900, // ₹1999/month
    description: "Priority listing, verified badge, unlimited leads"
  },
  premium: {
    name: "Elite Lawyer Listing",
    amount: 499900, // ₹4999/month
    description: "Featured homepage + category top + analytics"
  }
};

// ─── GET SUBSCRIPTION STATUS ──────────────────────────────────────────────────
router.get("/status", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("plan credits aiUsage listingTier subscriptionId subscriptionStatus subscriptionEndDate");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      plan: user.plan,
      credits: user.credits || 0,
      aiUsage: user.aiUsage,
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment verification fields" });
    }

    // Verify HMAC signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSig = crypto
      .createHmac("sha256", process.env.RZP_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    const config = PLAN_CONFIG[plan];
    if (!config) return res.status(400).json({ error: "Invalid plan" });

    // Calculate subscription end date (30 days)
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);

    // Upgrade user plan
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

    // Record payment
    await Payment.create({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      user: updatedUser._id,
      amount: config.amount / 100,
      plan: `subscription_${plan}`,
      type: "subscription"
    });

    res.json({
      success: true,
      plan: updatedUser.plan,
      subscriptionEndDate: updatedUser.subscriptionEndDate,
      message: `Successfully upgraded to ${plan.toUpperCase()} plan! Welcome aboard.`
    });
  } catch (err) {
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tier } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSig = crypto
      .createHmac("sha256", process.env.RZP_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    const listingEndDate = new Date();
    listingEndDate.setDate(listingEndDate.getDate() + 30);

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        listingTier: tier,
        isFeatured: tier === "premium",
        listingEndDate
      },
      { new: true }
    );

    await Payment.create({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      user: updatedUser._id,
      amount: LISTING_CONFIG[tier].amount / 100,
      plan: `listing_${tier}`,
      type: "listing"
    });

    res.json({
      success: true,
      listingTier: updatedUser.listingTier,
      isFeatured: updatedUser.isFeatured,
      listingEndDate: updatedUser.listingEndDate,
      message: `Listing upgraded to ${tier.toUpperCase()}! Your profile will now appear at the top.`
    });
  } catch (err) {
    console.error("Verify listing error:", err.message);
    res.status(500).json({ error: "Listing upgrade verification failed" });
  }
});

// ─── BUY CREDIT PACK ─────────────────────────────────────────────────────────
router.post("/buy-credits", verifyToken, async (req, res) => {
  try {
    const CREDIT_PACKS = {
      starter: { credits: 20, amount: 9900, label: "20 Queries" },
      standard: { credits: 100, amount: 39900, label: "100 Queries" },
      pro: { credits: 500, amount: 149900, label: "500 Queries" }
    };

    const { pack } = req.body;
    const selected = CREDIT_PACKS[pack];
    if (!selected) return res.status(400).json({ error: "Invalid credit pack" });
    if (!razorpay) return res.status(500).json({ error: "Payment gateway not configured" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const order = await razorpay.orders.create({
      amount: selected.amount,
      currency: "INR",
      receipt: `credits_${pack}_${req.userId.substring(0, 8)}_${Date.now()}`,
      notes: { pack, credits: selected.credits, userId: req.userId, type: "credits" }
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RZP_KEY_ID,
      pack: selected,
      user: { name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to create credit order" });
  }
});

// ─── VERIFY CREDIT PURCHASE ───────────────────────────────────────────────────
router.post("/verify-credits", verifyToken, async (req, res) => {
  try {
    const CREDIT_PACKS = {
      starter: { credits: 20, amount: 99 },
      standard: { credits: 100, amount: 399 },
      pro: { credits: 500, amount: 1499 }
    };

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, pack } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSig = crypto
      .createHmac("sha256", process.env.RZP_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSig !== razorpay_signature) return res.status(400).json({ error: "Invalid signature" });

    const selected = CREDIT_PACKS[pack];
    if (!selected) return res.status(400).json({ error: "Invalid pack" });

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $inc: { credits: selected.credits } },
      { new: true }
    );

    await Payment.create({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      user: updatedUser._id,
      amount: selected.amount,
      plan: `credits_${pack}`,
      type: "credits"
    });

    res.json({
      success: true,
      credits: updatedUser.credits,
      message: `${selected.credits} AI queries added to your account!`
    });
  } catch (err) {
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
