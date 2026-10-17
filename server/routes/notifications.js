const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");
const Notification = require("../models/Notification");
const verifyToken = require("../middleware/authMiddleware");
const { sendWhatsApp } = require("../utils/sms");

// GET /api/notifications
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
        res.json(notifications);
    } catch (err) {
        console.error("Fetch Notifications Error:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

// Manually trigger a WhatsApp alert (Secure)
router.post("/send-whatsapp", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { message } = req.body;

        if (!message) return res.status(400).json({ error: "Missing message" });

        const user = await User.findById(userId);
        if (!user || !user.phone) {
            return res.status(404).json({ error: "User or phone number not found" });
        }

        // Send WhatsApp
        await sendWhatsApp(user.phone, `NyayNow Alert: ${message}`);

        res.json({ success: true, message: "WhatsApp alert sent" });
    } catch (err) {
        console.error("WhatsApp Route Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/notifications/unread
router.get("/unread", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const unreadCount = await Message.countDocuments({
            $or: [{ clientId: userId }, { lawyerId: userId }],
            sender: { $ne: userId },
            read: false
        });
        res.json({ count: unreadCount });
    } catch (err) {
        console.error("Notifications Error:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

// Mark all read (Secure)
router.put("/mark-all-read", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        await Notification.updateMany({ userId, read: false }, { read: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

// Mark specific notification as read
router.put("/:id/read", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        await Notification.findOneAndUpdate({ _id: req.params.id, userId }, { read: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;
