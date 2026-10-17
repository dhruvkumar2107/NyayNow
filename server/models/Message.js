const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    index: true // e.g., "smallID-largeID" to ensure uniqueness for a pair
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  content: {
    type: String,
    required: true
  },
  readBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Message", messageSchema);
