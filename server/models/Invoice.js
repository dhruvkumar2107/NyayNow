const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
    lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    clientName: { type: String, required: true },
    clientEmail: { type: String },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["pending", "paid", "overdue"], default: "pending" },
    dueDate: { type: Date },
    createdAt: { type: Date, default: Date.now }
});


// ---- Performance Indexes ----
InvoiceSchema.index({ lawyerId: 1, createdAt: -1 });
InvoiceSchema.index({ clientId: 1 });
InvoiceSchema.index({ status: 1 });

module.exports = mongoose.model("Invoice", InvoiceSchema);
