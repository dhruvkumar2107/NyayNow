const express = require("express");
const router = express.Router();
const ChatHistory = require("../models/ChatHistory");
const verifyToken = require("../middleware/authMiddleware");

// GET /api/chats - Get all chat sessions of current user
router.get("/", verifyToken, async (req, res) => {
    try {
        const chats = await ChatHistory.find({ user: req.userId })
            .select("title updatedAt createdAt messages") // select everything
            .sort({ updatedAt: -1 });
        res.json(chats);
    } catch (err) {
        console.error("Fetch chats error:", err);
        res.status(500).json({ error: "Failed to fetch chat history" });
    }
});

// GET /api/chats/:id - Get a specific chat session details
router.get("/:id", verifyToken, async (req, res) => {
    try {
        const chat = await ChatHistory.findOne({ _id: req.params.id, user: req.userId });
        if (!chat) {
            return res.status(404).json({ error: "Chat history not found" });
        }
        res.json(chat);
    } catch (err) {
        console.error("Fetch chat detail error:", err);
        res.status(500).json({ error: "Failed to fetch chat session" });
    }
});

// POST /api/chats - Create a new chat session
router.post("/", verifyToken, async (req, res) => {
    try {
        const { title, messages } = req.body;
        const newChat = new ChatHistory({
            user: req.userId,
            title: title || "New Conversation",
            messages: messages || []
        });
        await newChat.save();
        res.status(201).json(newChat);
    } catch (err) {
        console.error("Create chat error:", err);
        res.status(500).json({ error: "Failed to create chat session" });
    }
});

// PUT /api/chats/:id - Update or append messages to a chat session
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const { title, messages } = req.body;
        const chat = await ChatHistory.findOne({ _id: req.params.id, user: req.userId });
        
        if (!chat) {
            return res.status(404).json({ error: "Chat history not found" });
        }

        if (title) chat.title = title;
        if (messages) chat.messages = messages; // Replace message stack or append

        await chat.save();
        res.json(chat);
    } catch (err) {
        console.error("Update chat error:", err);
        res.status(500).json({ error: "Failed to update chat session" });
    }
});

// DELETE /api/chats/:id - Delete a chat session (DPDP Act right to erase)
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const result = await ChatHistory.findOneAndDelete({ _id: req.params.id, user: req.userId });
        if (!result) {
            return res.status(404).json({ error: "Chat history not found" });
        }
        res.json({ success: true, message: "Chat history deleted permanently." });
    } catch (err) {
        console.error("Delete chat error:", err);
        res.status(500).json({ error: "Failed to delete chat session" });
    }
});

module.exports = router;
