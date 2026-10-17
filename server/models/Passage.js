const mongoose = require('mongoose');

const PassageSchema = new mongoose.Schema({
  docId: { type: mongoose.Schema.Types.ObjectId, ref: 'SourceDoc', required: true, index: true },
  paraNo: { type: String, required: true },
  text: { type: String, required: true, select: false },
  sha256: { type: String, required: true, index: true },
}, { timestamps: true, strict: true });

PassageSchema.index({ docId: 1, paraNo: 1 }, { unique: true });

module.exports = mongoose.models.Passage || mongoose.model('Passage', PassageSchema);
