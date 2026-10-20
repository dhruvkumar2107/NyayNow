const mongoose = require("mongoose");

// Replay guard for inbound payment-provider webhooks (e.g. Razorpay).
// `key` is a deterministic dedup key derived from the event payload (provider
// payment id when available, else subscription id + event, else event id).
// A unique index makes concurrent duplicate delivery a no-op via duplicate-key.
const webhookEventSchema = new mongoose.Schema(
    {
        key: { type: String, required: true, unique: true },
        event: { type: String },
        provider: { type: String, default: "razorpay" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("WebhookEvent", webhookEventSchema);
