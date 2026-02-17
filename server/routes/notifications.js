const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User"); // Add User model to fetch phone number
const { sendWhatsApp } = require("../utils/sms"); // Import WhatsApp utility

// POST /api/notifications/send-whatsapp
// Manually trigger a WhatsApp alert (e.g., when a new case is assigned or urgent message received)
router.post("/send-whatsapp", async (req, res) => {
    try {
        const { userId, message } = req.body;

        if (!userId || !message) return res.status(400).json({ error: "Missing fields" });

        const user = await User.findById(userId);
        if (!user || !user.phone) {
            return res.status(404).json({ error: "User or phone number not found" });
        }

        // Send WhatsApp
        await sendWhatsApp(user.phone, `Scalable Justice Alert: ${message}`);

        res.json({ success: true, message: "WhatsApp alert sent" });
    } catch (err) {
        console.error("WhatsApp Route Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/notifications/unread?userId=...
router.get("/unread", async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: "Missing userId" });

        // Count messages where I am the recipient (so either I am client and sender is lawyer, or vice versa)
        // BUT Message model stores 'clientId' and 'lawyerId'.
        // We need to check who sent it.
        // If I am userId, and I am the clientId... I care about messages sent by lawyerId (where senderId is NOT me).

        const unreadCount = await Message.countDocuments({
            $or: [{ clientId: userId }, { lawyerId: userId }],
            senderId: { $ne: userId }, // Not sent by me
            read: false
        });

        res.json({ count: unreadCount });
    } catch (err) {
        console.error("Notifications Error:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

// PUT /api/notifications/read?chatId=...&userId=...
// Mark all messages in a specific chat as read for this user
router.put("/read", async (req, res) => {
    try {
        const { chatId, userId } = req.body;
        // chatId is effectively the 'other' person's ID in our current simplified chat logic.
        // OR we filter by conversation pair.

        // We update all messages between userId and chatId where sender is chatId.

        await Message.updateMany(
            {
                $or: [
                    { clientId: userId, lawyerId: chatId },
                    { clientId: chatId, lawyerId: userId }
                ],
                senderId: chatId, // Sent BY the other person
                read: false
            },
            { $set: { read: true } }
        );

        res.json({ success: true });
    } catch (err) {
        console.error("Mark Read Error:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;
