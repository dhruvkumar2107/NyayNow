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
    res.json(message);
  } catch {
    res.status(400).json({ error: "Failed to send message" });
  }
});

module.exports = router;
