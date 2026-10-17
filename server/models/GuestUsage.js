const mongoose = require("mongoose");

const GuestUsageSchema = new mongoose.Schema(
    {
        ip: { type: String, required: true, unique: true, index: true },
        count: { type: Number, default: 0 },
        resetAt: { type: Date, required: true }
    },
    { timestamps: true }
);

// TTL index to automatically clear entries after resetAt has passed
// (expireAfterSeconds: 0 deletes the document when current time > resetAt)
GuestUsageSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("GuestUsage", GuestUsageSchema);
