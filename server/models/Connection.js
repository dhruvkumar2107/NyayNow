const mongoose = require("mongoose");

const ConnectionSchema = new mongoose.Schema(
    {
        clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        status: {
            type: String,
            enum: ["pending", "active", "rejected"],
            default: "pending"
        },
        initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    },
    { timestamps: true }
);

// Ensure unique pair interaction
ConnectionSchema.index({ clientId: 1, lawyerId: 1 }, { unique: true });

module.exports = mongoose.model("Connection", ConnectionSchema);
