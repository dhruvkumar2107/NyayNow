const crypto = require("crypto");
const User = require("../models/User");
const Payment = require("../models/Payment");
const { PLAN_PRICES_PAISE } = require("../config/plans");

// Server-authoritative plan→amount map (paise) lives in config/plans.js.
// Never trust client-supplied amounts. Re-exported here for backward compat.

function verifySignature(orderId, paymentId, signature) {
  if (!process.env.RZP_KEY_SECRET || typeof signature !== "string") return false;
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", process.env.RZP_KEY_SECRET)
    .update(body)
    .digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const providedBuf = Buffer.from(signature, "utf8");
  // Constant-time comparison; length mismatch short-circuits (timingSafeEqual throws otherwise).
  return expectedBuf.length === providedBuf.length && crypto.timingSafeEqual(expectedBuf, providedBuf);
}

/**
 * Apply post-payment outcome: upgrade plan, add credits, or mark appointment paid.
 * Returns { user } on success, throws on failure.
 */
async function applyPaymentOutcome(userId, verifiedPlan, verifiedAmount, razorpayOrderId, razorpayPaymentId, razorpaySignature) {
  const normalizedPlan = verifiedPlan.toLowerCase();
  const isCreditPack  = normalizedPlan.startsWith("credits_");
  const isAppointment = normalizedPlan.startsWith("appointment_");
  const isInvoice     = normalizedPlan.startsWith("invoice_");

  // ── IDEMPOTENCY ────────────────────────────────────────────────────────────
  // If this provider payment has already been applied, do NOT apply it again
  // (prevents replayed /verify calls from duplicating credits or entitlements).
  const existing = await Payment.findOne({ paymentId: razorpayPaymentId });
  if (existing) {
    const currentUser = await User.findById(userId);
    if (currentUser) return { user: currentUser, duplicate: true };
  }

  let updatedUser;

  if (isAppointment) {
    const Appointment = require("../models/Appointment");
    const parts = normalizedPlan.split("_");
    const appointmentId = parts[1];
    const updatedApt = await Appointment.findByIdAndUpdate(
      appointmentId,
      { paymentStatus: "paid", status: "confirmed", paymentId: razorpayPaymentId },
      { new: true }
    );
    if (!updatedApt) throw Object.assign(new Error("Appointment not found"), { status: 404 });
    updatedUser = await User.findById(userId);
  } else if (isInvoice) {
    const Invoice = require("../models/Invoice");
    const parts = normalizedPlan.split("_");
    const invoiceId = parts[1];
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      { status: "paid", clientId: userId },
      { new: true }
    );
    if (!updatedInvoice) throw Object.assign(new Error("Invoice not found"), { status: 404 });
    updatedUser = await User.findById(userId);
  } else if (isCreditPack) {
    const credits = parseInt(normalizedPlan.split("_")[1]) || 0;
    const userObj = await User.findById(userId);
    if (!userObj) throw Object.assign(new Error("User not found"), { status: 404 });
    userObj.credits = (userObj.credits || 0) + credits;
    updatedUser = await userObj.save();
  } else {
    updatedUser = await User.findByIdAndUpdate(userId, { plan: normalizedPlan }, { new: true });
  }

  if (!updatedUser) throw Object.assign(new Error("User not found"), { status: 404 });

  await Payment.create({
    orderId:   razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
    user:      updatedUser._id,
    amount:    verifiedAmount / 100,
    plan:      verifiedPlan,
  });

  return { user: updatedUser };
}

module.exports = { PLAN_PRICES_PAISE, verifySignature, applyPaymentOutcome };
