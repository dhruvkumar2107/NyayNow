const mongoose = require("mongoose");

const OtpEntrySchema = new mongoose.Schema(
    {
        email:     { type: String, required: true, unique: true, index: true },
        otp:       { type: String, required: true },
        expiresAt: { type: Date,   required: true },
        attempts:  { type: Number, default: 0 },   // brute-force counter
    },
    { timestamps: true }
);

// TTL index: MongoDB auto-deletes expired entries
OtpEntrySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OtpEntry", OtpEntrySchema);
