const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        orderId: { type: String, required: true },
        paymentId: { type: String, required: true },
        signature: { type: String, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        amount: { type: Number, required: true }, // in rupees
        plan: { type: String, required: true },
        status: { type: String, default: "success" },
        date: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
