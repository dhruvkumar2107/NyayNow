const mongoose = require("mongoose");

const CasePredictionSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        caseTitle: { type: String, required: true },
        caseDescription: { type: String },
        winProbability: { type: Number },
        riskLevel: { type: String },
        precedentCount: { type: Number },
        strategy: [{ type: String }],
        riskAnalysis: [{ type: String }],
        relevantPrecedent: { type: String },
        confidencePercentage: { type: Number }
    },
    { timestamps: true }
);

module.exports = mongoose.model("CasePrediction", CasePredictionSchema);
