const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const verifyToken = require("../middleware/authMiddleware");

// GET /api/messages/:userId -> Get conversation with specific user
router.get("/:otherUserId", verifyToken, async (req, res) => {
  try {
    const myId = req.user.id;
    const otherId = req.params.otherUserId;

    // Generate conversation ID (sorted to ensure uniqueness per pair)
    const conversationId = [myId, otherId].sort().join("-");

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 }) // Oldest first
      .populate("sender", "name role");

    res.json(messages);
  } catch (err) {
    console.error("Fetch Messages Error:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// POST /api/messages/send -> Save message
router.post("/send", verifyToken, async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const myId = req.user.id;

    const conversationId = [myId, recipientId].sort().join("-");

    const newMessage = await Message.create({
      conversationId,
      sender: myId,
      content,
      readBy: [myId]
    });

    // Populate sender for frontend
    await newMessage.populate("sender", "name role");

    // Real-time emission handled by Socket.io in index.js, 
    // BUT we can also emit here if we pass 'io' instance to routes (req.io)
    if (req.io) {
      // Emit to recipient's room
      req.io.to(recipientId).emit("receive_message", newMessage);
      // Emit to sender's room (optional, for multi-device sync)
      req.io.to(myId).emit("receive_message", newMessage); // Or let frontend handle optimistic UI
    }

    res.json(newMessage);
  } catch (err) {
    console.error("Send Message Error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

module.exports = router;
