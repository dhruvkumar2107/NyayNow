const express = require("express");
const Message = require("../models/Message");

const router = express.Router();

/**
 * GET /api/messages?lawyer=NAME
 * Fetch messages for a lawyer
 */
router.get("/", async (req, res) => {
  try {
    const { lawyer } = req.query;
    const messages = await Message.find(
      lawyer ? { lawyerName: lawyer } : {}
    ).sort({ createdAt: 1 });

    res.json(messages);
  } catch {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

/**
 * POST /api/messages
 * Send a message
 */
router.post("/", async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();

    // Real-time emit to room = lawyerName
    if (req.io) {
      req.io.to(req.body.lawyerName).emit("receive_message", message);
    }

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to send message" });
  }
});

module.exports = router;
