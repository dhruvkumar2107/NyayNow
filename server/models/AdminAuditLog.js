const mongoose = require("mongoose");

// Dedicated, append-only audit trail for sensitive admin actions
// (e.g. lawyer verification decisions, plan overrides). Kept separate from
// the role-change AuditLog so it can capture arbitrary action metadata.
const adminAuditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true, // e.g. 'lawyer_verified', 'lawyer_rejected', 'user_plan_changed'
    },
    targetType: {
      type: String,
      default: "user",
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ip: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "admin_audit_logs" }
);

module.exports = mongoose.model("AdminAuditLog", adminAuditLogSchema);
