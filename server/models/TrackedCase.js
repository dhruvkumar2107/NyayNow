const mongoose = require('mongoose');

const TrackedCaseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cnr: { type: String, required: true },
  caseNumber: { type: String },
  petitioner: { type: String },
  respondent: { type: String },
  court: { type: String },
  judge: { type: String },
  stage: { type: String },
  status: { type: String },
  nextHearing: { type: String },
  history: [{
    date: String,
    action: String,
    outcome: String
  }],
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure unique tracking per user
TrackedCaseSchema.index({ user: 1, cnr: 1 }, { unique: true });

module.exports = mongoose.model('TrackedCase', TrackedCaseSchema);
