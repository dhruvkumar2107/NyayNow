const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/User");

/* -------------------- RAZORPAY INIT -------------------- */
const razorpay = new Razorpay({
  key_id: process.env.RZP_KEY_ID,
  key_secret: process.env.RZP_KEY_SECRET
});

/* -------------------- CREATE ORDER -------------------- */
/**
 * POST /api/payments/create-order
 */
router.post("/create-order", async (req, res) => {
  try {
    const { amount_rupees, plan, email } = req.body;

    if (!amount_rupees || !plan || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const order = await razorpay.orders.create({
      amount: amount_rupees * 100, // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { plan, email }
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RZP_KEY_ID
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

/* -------------------- VERIFY PAYMENT -------------------- */
/**
 * POST /api/payments/verify
 */
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      email,
      amount // Expect amount passed from frontend for record keeping
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment details" });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RZP_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const User = require("../models/User");
    const Payment = require("../models/Payment");

    // 1. Upgrade User
    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        plan: plan.toLowerCase(),
        verified: true
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2. Save Payment Record
    await Payment.create({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      user: updatedUser._id,
      amount: amount || 0, // Fallback if not sent
      plan: plan
    });

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

module.exports = router;
