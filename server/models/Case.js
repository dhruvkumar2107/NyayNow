// server/models/Case.js
const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, default: '' },
  field: { type: String, default: '' },
  location: { type: String, default: '' },
  budget: { type: String, default: '' },
  postedBy: { type: String, default: '' },
  postedAt: { type: Date, default: Date.now },
  acceptedBy: { type: String, default: null }
});

module.exports = mongoose.model('Case', CaseSchema);
