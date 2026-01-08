const express = require("express");
const Message = require("../models/Message");

const router = express.Router();

/**
 * GET /api/messages
 * Fetch messages between specific client and lawyer
 */
router.get("/", async (req, res) => {
  try {
    const { clientId, lawyerId } = req.query;

    if (!clientId || !lawyerId) {
      return res.status(400).json({ error: "Missing clientId or lawyerId" });
    }

    const messages = await Message.find({ clientId, lawyerId })
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

/**
 * POST /api/messages
 * Send a message
 */
router.post("/", async (req, res) => {
  try {
    const { text, sender, clientId, lawyerId, senderId } = req.body;

    const message = new Message({
      text,
      sender,
      senderId,
      clientId,
      lawyerId
    });

    await message.save();

    // Real-time emit to unique room for this pair
    const roomName = `${clientId}-${lawyerId}`; // Unique room for this pair
    if (req.io) {
      req.io.to(roomName).emit("receive_message", message);
    }

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to send message" });
  }
});

module.exports = router;
