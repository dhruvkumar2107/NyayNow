const mongoose = require("mongoose");

const OtpEntrySchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, index: true },
        otp: { type: String, required: true },
        expiresAt: { type: Date, required: true }
    },
    { timestamps: true }
);

// TTL index to automatically delete expired OTP entries
OtpEntrySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OtpEntry", OtpEntrySchema);
