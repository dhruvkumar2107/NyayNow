const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
    {
        clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        date: { type: String, required: true }, // YYYY-MM-DD
        slot: { type: String, required: true }, // "10:00 AM"
        status: {
            type: String,
            enum: ["pending", "confirmed", "rejected", "completed"],
            default: "pending"
        },
        notes: { type: String },
        meetingLink: { type: String }, // For auto-generated video links
        fee: { type: Number, default: 0 },
        commission: { type: Number, default: 0 }, // Platform commission (e.g. 15%)
        paymentStatus: { type: String, enum: ["unpaid", "paid", "refunded"], default: "unpaid" },
        paymentId: { type: String }
    },
    { timestamps: true }
);


// ---- Performance Indexes ----
AppointmentSchema.index({ lawyerId: 1, date: 1 });
AppointmentSchema.index({ clientId: 1 });

module.exports = mongoose.model("Appointment", AppointmentSchema);
