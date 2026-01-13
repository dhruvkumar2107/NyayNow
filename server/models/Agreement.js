const mongoose = require("mongoose");

const AgreementSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        required: true, // e.g., "Rent Agreement"
    },
    content: {
        type: String, // MarkDown content
        required: true,
    },
    parties: {
        partyA: String,
        partyB: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },

    // eSign Fields
    isSigned: { type: Boolean, default: false },
    signatureDate: { type: Date },
    signerName: { type: String },
    aadhaarTxId: { type: String },
});

module.exports = mongoose.model("Agreement", AgreementSchema);
