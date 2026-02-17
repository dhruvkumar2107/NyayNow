// server/models/Case.js
const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, default: '' },
  category: { type: String, default: 'General' }, // Renamed from field for consistency
  location: { type: String, default: '' },
  budget: { type: String, default: '' },

  // Legacy fields (String based)
  postedBy: { type: String, default: '' },
  acceptedBy: { type: String, default: null },

  // Enterprise Refs
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lawyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Kanban Stage
  stage: {
    type: String,
    enum: ['New Lead', 'Discovery', 'Filing', 'Hearing', 'Judgment', 'Closed'],
    default: 'New Lead'
  },

  // Visual Timeline
  timeline: [{
    title: String,
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['completed', 'pending', 'upcoming'], default: 'completed' },
    desc: String
  }],

  postedAt: { type: Date, default: Date.now },
});

const { syncLead, deleteRecord } = require("../utils/algolia");

CaseSchema.post("save", function (doc) {
  syncLead(doc);
});

CaseSchema.post("findOneAndDelete", function (doc) {
  if (doc) {
    deleteRecord("leads", doc._id.toString());
  }
});

module.exports = mongoose.model('Case', CaseSchema);
