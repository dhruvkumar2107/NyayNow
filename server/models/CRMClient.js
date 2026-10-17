const mongoose = require("mongoose");

const CRMClientSchema = new mongoose.Schema({
    lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    notes: { type: String },
    caseHistory: [{ type: String }], // Simple array of strings for now
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CRMClient", CRMClientSchema);
