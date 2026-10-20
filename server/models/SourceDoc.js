const mongoose = require('mongoose');

const SourceDocSchema = new mongoose.Schema({
  type: { type: String, enum: ['statute', 'judgment', 'gazette', 'official_data'], required: true, index: true },
  jurisdiction: { type: String, required: true },
  title: { type: String, required: true },
  canonicalUrl: { type: String, required: true },
  text: { type: String, required: true, select: false },
  sha256: { type: String, required: true, index: true },
  version: { type: String, required: true },
  validFrom: { type: Date, default: null },
  validTo: { type: Date, default: null },
  recordedAt: { type: Date, default: Date.now },
  licenceStatus: { type: String, enum: ['approved', 'public_official', 'pending', 'restricted'], default: 'pending', index: true },
}, { timestamps: true, strict: true });

SourceDocSchema.index({ type: 1, jurisdiction: 1, validFrom: 1, validTo: 1 });

module.exports = mongoose.models.SourceDoc || mongoose.model('SourceDoc', SourceDocSchema);
