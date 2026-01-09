const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    sender: { type: String, required: true },   // client / lawyer (legacy role) or senderId
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Precise Sender
    text: { type: String, required: true },

    // Relationship Mapping
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Legacy support (optional, can keep for backward compat for a bit)
    lawyerName: { type: String },

    read: { type: Boolean, default: false } // New for Notifications
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
