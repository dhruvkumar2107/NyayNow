const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true, // e.g. 'role_created', 'role_changed'
    },
    oldRole: {
      type: String,
      default: null,
    },
    newRole: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "audit_logs" }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
