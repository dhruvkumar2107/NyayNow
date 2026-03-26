const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const verifyToken = require("../middleware/authMiddleware");
const User = require("../models/User");

/* -------------------- RAZORPAY INIT -------------------- */
const razorpay = new Razorpay({
  key_id: process.env.RZP_KEY_ID,
  key_secret: process.env.RZP_KEY_SECRET
});

const Payment = require("../models/Payment");

/**
 * POST /api/payments/create-order
 */
router.post("/create-order", verifyToken, async (req, res) => {
  try {
    const { amount_rupees, plan } = req.body;

    // Fetch current user email from DB to ensure integrity
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!amount_rupees || !plan) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const order = await razorpay.orders.create({
      amount: amount_rupees * 100, // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}_${req.userId.substring(0, 5)}`,
      notes: { plan, email: user.email, userId: req.userId }
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RZP_KEY_ID
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ 
      error: "Order creation failed", 
      details: err.message || "Unknown error",
      code: err.code || null
    });
  }
});

/* -------------------- VERIFY PAYMENT -------------------- */
/**
 * POST /api/payments/verify
 */
router.post("/verify", verifyToken, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
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
    // NOTE: We have removed automatic verification on payment to ensure BCI compliance
    // and avoid consumer fraud risk. Verification is now a manual administrative action.
    const updateData = {
      plan: plan.toLowerCase()
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      updateData,
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
