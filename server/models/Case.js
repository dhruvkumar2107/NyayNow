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

// post-save: fire-and-forget Algolia sync; errors are logged but never crash the save
CaseSchema.post("save", function (doc) {
  syncLead(doc).catch(err =>
    console.error("[Algolia] post-save sync failed for case", doc._id, ":", err.message)
  );
});

CaseSchema.post("findOneAndDelete", function (doc) {
  if (doc) {
    deleteRecord("leads", doc._id.toString()).catch(err =>
      console.error("[Algolia] post-delete sync failed for case", doc._id, ":", err.message)
    );
  }
});

// ---- Performance Indexes ----
CaseSchema.index({ postedBy: 1, createdAt: -1 });
CaseSchema.index({ lawyer: 1 });   // was incorrectly `lawyerId` — field is `lawyer`
CaseSchema.index({ stage: 1 });    // was `status` — field is `stage`

module.exports = mongoose.model('Case', CaseSchema);
