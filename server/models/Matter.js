// server/models/Matter.js
// NyayNow Matter Intelligence: permissioned workspace linking intake, evidence,
// research, drafts, review and audit for one legal matter.
const mongoose = require("mongoose");

// The five provenance categories. A statement's kind is set when it is created
// and must never be changed implicitly by the application.
const STATEMENT_KINDS = [
  "allegation",        // user-asserted fact (unverified)
  "document-extract",  // text attributed to an uploaded document
  "source-text",       // text from a legal source
  "ai-inference",      // model-generated inference
  "lawyer-conclusion", // conclusion made by an authorised professional
];

const KeyDateSchema = new mongoose.Schema(
  { label: { type: String, required: true }, date: { type: Date } },
  { _id: false }
);

const StatementSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: STATEMENT_KINDS, required: true },
    text: { type: String, required: true, maxlength: 5000 },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    at: { type: Date, default: Date.now },
    confirmed: { type: Boolean, default: false },
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    confirmedAt: { type: Date },
    evidenceRef: { type: mongoose.Schema.Types.ObjectId }, // evidence._id when kind=document-extract
    sourceRef: { type: String },                           // research._id string when kind=source-text
  },
  { _id: true }
);

const EvidenceSchema = new mongoose.Schema(
  {
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    filename: { type: String, required: true },
    path: { type: String, required: true }, // URL or /uploads/... reference (from /api/uploads)
    description: { type: String, default: "" },
    addedAt: { type: Date, default: Date.now },
    extractionStatus: {
      type: String,
      enum: ["not-started", "pending", "extracted", "failed"],
      default: "not-started",
    },
    extractedPassages: [
      {
        text: { type: String, maxlength: 4000 },
        statementRef: { type: mongoose.Schema.Types.ObjectId },
      },
    ],
  },
  { _id: true }
);

const ResearchSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    sourceId: { type: String, default: "" },
    url: { type: String, default: "" },
    jurisdiction: { type: String, default: "" },
    court: { type: String, default: "" },
    date: { type: Date },
    passage: { type: String, required: true, maxlength: 6000 },
    availability: {
      type: String,
      enum: ["available", "unavailable", "unknown"],
      default: "unknown",
    },
    synthetic: { type: Boolean, default: false }, // fixture data, never presented as real law
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    at: { type: Date, default: Date.now },
  },
  { _id: true }
);

const DraftSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    body: { type: String, default: "", maxlength: 60000 },
    placeholders: [{ type: String }],
    assertions: [
      {
        text: { type: String, maxlength: 2000 },
        kind: { type: String, enum: ["factual", "legal"], required: true },
        statementRefs: [{ type: mongoose.Schema.Types.ObjectId }],
        researchRefs: [{ type: mongoose.Schema.Types.ObjectId }],
      },
    ],
    version: { type: Number, default: 1 },
    savedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    savedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ReviewRequestSchema = new mongoose.Schema(
  {
    draftRef: { type: mongoose.Schema.Types.ObjectId },
    note: { type: String, maxlength: 2000, default: "" },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    requestedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "accepted", "edited", "rejected"],
      default: "pending",
    },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    decidedAt: { type: Date },
    reason: { type: String, maxlength: 2000, default: "" },
  },
  { _id: true }
);

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 300 },
    dueDate: { type: Date },
    status: { type: String, enum: ["open", "done"], default: "open" },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: true }
);

const ConsentSchema = new mongoose.Schema(
  {
    purpose: { type: String, required: true, maxlength: 200 },
    granted: { type: Boolean, required: true },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    at: { type: Date, default: Date.now },
    note: { type: String, maxlength: 1000, default: "" },
  },
  { _id: true }
);

const AuditEventSchema = new mongoose.Schema(
  {
    at: { type: Date, default: Date.now },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    actorRole: { type: String, default: "" },
    action: { type: String, required: true, maxlength: 100 },
    detail: { type: String, maxlength: 500, default: "" },
  },
  { _id: false }
);

const MatterSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 300 },
    matterType: { type: String, default: "general", maxlength: 60 },
    jurisdiction: { type: String, default: "", maxlength: 120 },
    keyDates: [KeyDateSchema],

    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // The single authorised professional for this matter. Unassigned = null.
    lawyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    // Explicitly granted additional readers/collaborators (never "all lawyers").
    access: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, default: "viewer" },
        grantedAt: { type: Date, default: Date.now },
      },
    ],

    intake: {
      status: { type: String, enum: ["draft", "submitted", "confirmed"], default: "draft" },
      submittedAt: { type: Date },
      confirmedAt: { type: Date },
      missingFields: [{ type: String }],
    },

    statements: [StatementSchema],
    evidence: [EvidenceSchema],
    chronology: [
      {
        date: { type: Date },
        event: { type: String, maxlength: 1000 },
        statementRef: { type: mongoose.Schema.Types.ObjectId },
      },
    ],
    legalIssues: [
      {
        issue: { type: String, maxlength: 500 },
        status: { type: String, enum: ["open", "researching", "resolved"], default: "open" },
      },
    ],
    research: [ResearchSchema],
    drafts: [DraftSchema],
    reviewRequests: [ReviewRequestSchema],
    tasks: [TaskSchema],
    consents: [ConsentSchema],
    auditEvents: [AuditEventSchema],
  },
  { timestamps: true }
);

MatterSchema.index({ client: 1, createdAt: -1 });
MatterSchema.index({ lawyer: 1 });

// Append a capped audit event.
MatterSchema.methods.recordEvent = function ({ actor, actorRole, action, detail }) {
  this.auditEvents.push({ at: new Date(), actor, actorRole, action, detail: detail || "" });
  if (this.auditEvents.length > 200) {
    this.auditEvents = this.auditEvents.slice(-200);
  }
};

/**
 * Pure access check (unit-testable, no DB).
 * Hiding UI elements is not authorization — every matter route must call this.
 * Returns { allowed: boolean, via: 'admin'|'client'|'lawyer'|'grant'|null }
 */
function matterAccess(matter, userId, role) {
  if (!matter || !userId) return { allowed: false, via: null };
  const id = String(userId);
  if (role === "admin") return { allowed: true, via: "admin" };
  if (matter.client && String(matter.client) === id) return { allowed: true, via: "client" };
  if (matter.lawyer && String(matter.lawyer) === id) return { allowed: true, via: "lawyer" };
  const grant = (matter.access || []).find((a) => a && String(a.user) === id);
  if (grant) return { allowed: true, via: "grant" };
  return { allowed: false, via: null };
}

// Mass-assignment whitelist for matter creation. Ownership and privileged
// collections are never taken from the request body.
const CREATE_FIELDS = ["title", "matterType", "jurisdiction", "keyDates"];
function pickMatterCreateFields(body) {
  const out = {};
  for (const f of CREATE_FIELDS) {
    if (body && body[f] !== undefined) out[f] = body[f];
  }
  return out;
}

const ALLOWED_INTAKE_FIELDS = ["title", "matterType", "jurisdiction", "keyDates"];
function pickIntakeFields(body) {
  const out = {};
  for (const f of ALLOWED_INTAKE_FIELDS) {
    if (body && body[f] !== undefined) out[f] = body[f];
  }
  return out;
}

const Matter = mongoose.model("Matter", MatterSchema);

module.exports = Matter;
module.exports.STATEMENT_KINDS = STATEMENT_KINDS;
module.exports.matterAccess = matterAccess;
module.exports.pickMatterCreateFields = pickMatterCreateFields;
module.exports.pickIntakeFields = pickIntakeFields;
