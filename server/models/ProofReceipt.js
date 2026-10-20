const mongoose = require('mongoose');

const ProofCitationSchema = new mongoose.Schema({
  sourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'SourceDoc', required: true },
  passageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Passage', required: true },
  quote: { type: String, required: true, maxlength: 4000 },
  claim: { type: String, required: true, maxlength: 2000 },
  sourceSha256: { type: String, required: true },
  passageSha256: { type: String, required: true },
}, { _id: false });

const ProofReceiptSchema = new mongoose.Schema({
  answerId: { type: String, required: true, index: true },
  citations: { type: [ProofCitationSchema], required: true },
  asOfDate: { type: Date, required: true, index: true },
  corpusVersion: { type: String, required: true },
  modelVersion: { type: String, required: true },
  verifierResult: { type: String, enum: ['pass', 'fail'], required: true, index: true },
  verifierChecks: [{ type: String }],
  createdAt: { type: Date, default: Date.now, immutable: true },
  signature: { type: String, required: true, select: false },
  signatureAlgorithm: { type: String, enum: ['HMAC-SHA256'], default: 'HMAC-SHA256' },
}, { timestamps: false, strict: true });

module.exports = mongoose.models.ProofReceipt || mongoose.model('ProofReceipt', ProofReceiptSchema);
