const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const verifyToken = require("../middleware/authMiddleware");
const User = require("../models/User");
const { PLAN_PRICES_PAISE, verifySignature, applyPaymentOutcome } = require("../services/paymentService");

/* -------------------- RAZORPAY INIT -------------------- */
const razorpay = process.env.RZP_KEY_ID ? new Razorpay({
  key_id: process.env.RZP_KEY_ID,
  key_secret: process.env.RZP_KEY_SECRET
}) : null;

// Health check to verify Keys on server startup
if (!process.env.RZP_KEY_ID) {
  console.error("❌ RAZORPAY ERROR: RZP_KEY_ID is missing from environment variables!");
} else {
  console.log("✅ RAZORPAY INFO: Key ID is present:", process.env.RZP_KEY_ID.substring(0, 8) + "...");
}


/**
 * POST /api/payments/create-order
 * Amount is derived server-side from the plan; client-supplied amount is ignored.
 * Idempotency: receipt key is user+plan+date(hour) so double-taps in the same hour reuse the same order.
 */
router.post("/create-order", verifyToken, async (req, res) => {
  try {
    const { plan, appointmentId } = req.body;

    if (!plan || typeof plan !== 'string') {
      return res.status(400).json({ error: "Missing or invalid plan" });
    }

    const normalizedPlan = plan.toLowerCase();

    // Fetch current user from DB to ensure integrity
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    let amountPaise;

    if (normalizedPlan.startsWith("appointment_")) {
      // Appointment payments: derive amount from the appointment record
      const Appointment = require("../models/Appointment");
      const apt = await Appointment.findById(appointmentId);
      if (!apt || apt.clientId.toString() !== req.userId) {
        return res.status(403).json({ error: "Appointment not found or not yours" });
      }
      amountPaise = Math.round(apt.fee * 100);
    } else if (PLAN_PRICES_PAISE[normalizedPlan]) {
      amountPaise = PLAN_PRICES_PAISE[normalizedPlan];
    } else {
      return res.status(400).json({ error: "Invalid or unrecognized plan" });
    }

    if (!razorpay) {
      return res.status(500).json({ error: "Razorpay payment integration is not configured on this server instance." });
    }

    // Idempotency receipt: reuse within the same hour to avoid duplicate orders on double-click
    const hourSlot = Math.floor(Date.now() / (60 * 60 * 1000));
    const receipt = `rcpt_${req.userId.substring(0, 8)}_${normalizedPlan.substring(0, 10)}_${hourSlot}`;

    const orderOptions = {
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes: { plan: normalizedPlan, email: user.email, userId: req.userId }
    };

    const order = await razorpay.orders.create(orderOptions);

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
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
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
      razorpay_signature
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment details" });
    }

    if (!razorpay) {
      return res.status(500).json({ error: "Razorpay payment integration is not configured." });
    }

    if (!verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Fetch order server-side from Razorpay to prevent tampering
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const verifiedPlan = order.notes?.plan;
    const verifiedAmount = order.amount; // in paise
    const verifiedUserId = order.notes?.userId;

    if (!verifiedPlan) {
      return res.status(400).json({ error: "Order missing plan metadata" });
    }

    // Verify the order belongs to the requesting user
    if (verifiedUserId && verifiedUserId !== req.userId) {
      return res.status(403).json({ error: "Order does not belong to this user" });
    }

    const normalizedPlan = verifiedPlan.toLowerCase();
    const isAppointment = normalizedPlan.startsWith("appointment_");

    // Amount integrity check
    if (isAppointment) {
      const parts = normalizedPlan.split("_");
      const appointmentId = parts[1];
      const Appointment = require("../models/Appointment");
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment || appointment.clientId.toString() !== req.userId) {
        return res.status(403).json({ error: "Appointment not found or not yours" });
      }
      if (verifiedAmount !== Math.round(appointment.fee * 100)) {
        return res.status(400).json({ error: "Amount mismatch for appointment fee" });
      }
    } else if (PLAN_PRICES_PAISE[normalizedPlan]) {
      if (verifiedAmount !== PLAN_PRICES_PAISE[normalizedPlan]) {
        return res.status(400).json({ error: "Amount mismatch for plan" });
      }
    } else {
      return res.status(400).json({ error: "Invalid or unrecognized plan" });
    }

    const { user: updatedUser } = await applyPaymentOutcome(
      req.userId, verifiedPlan, verifiedAmount,
      razorpay_order_id, razorpay_payment_id, razorpay_signature
    );

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

/* -------------------- RAZORPAY WEBHOOK -------------------- */
/**
 * POST /api/payments/webhook
 * Razorpay sends events here. Must be registered in the Razorpay Dashboard.
 * NOTE: This route must receive the RAW body - do NOT add express.json() before this route.
 */
router.post("/webhook", express.raw({ type: "application/json", limit: "100kb" }), async (req, res) => {
  try {
    const webhookSecret = process.env.RZP_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("❌ RZP_WEBHOOK_SECRET is not set. Rejecting webhook.");
      return res.status(500).json({ error: "Webhook secret not configured" });
    }

    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
      return res.status(400).json({ error: "Missing Razorpay signature header" });
    }

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body) // raw Buffer
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("⚠️  Razorpay webhook signature mismatch - possible forgery");
      return res.status(400).json({ error: "Invalid webhook signature" });
    }

    const event = JSON.parse(req.body.toString());
    const eventType = event.event;

    console.log(`[Webhook] Received Razorpay event: ${eventType}`);

    // Handle payment.captured and subscription.charged
    if (eventType === "payment.captured" || eventType === "subscription.charged") {
      let notes;
      if (eventType === "payment.captured") {
        notes = event.payload?.payment?.entity?.notes || {};
      } else {
        // subscription.charged - notes live on the subscription
        notes = event.payload?.subscription?.entity?.notes || {};
      }

      const { userId, plan } = notes;

      if (userId && plan) {
        const cleanPlan = plan.toLowerCase();
        // Only upgrade subscription plans, not credit packs or appointment payments
        if (!cleanPlan.startsWith("credits_") && !cleanPlan.startsWith("appointment_")) {
          await User.findByIdAndUpdate(userId, { plan: cleanPlan }, { new: true });
          console.log(`[Webhook] Upgraded user ${userId} to plan: ${cleanPlan}`);
        }
      } else {
        console.warn(`[Webhook] ${eventType} missing userId or plan in notes:`, notes);
      }
    }

    // Always return 200 so Razorpay doesn't retry
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("[Webhook] Error processing Razorpay webhook:", err);
    // Still return 200 to prevent Razorpay from retrying on our internal errors
    return res.status(200).json({ received: true });
  }
});

module.exports = router;
