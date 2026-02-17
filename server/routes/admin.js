const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Payment = require('../models/Payment'); // Make sure this model exists
const verifyToken = require('../middleware/authMiddleware');

// GET /api/admin/stats
router.get('/stats', verifyToken, async (req, res) => {
    try {
        // Only allow admin (or upgrade to admin middleware)
        // if (req.userRole !== 'admin') return res.status(403).json({ error: "Access denied" });

        const totalUsers = await User.countDocuments();
        const pendingLawyers = await User.countDocuments({ role: 'lawyer', verified: false });

        // Aggregate Revenue
        const revenueAgg = await Payment.aggregate([
            { $match: { status: 'success' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        res.json({
            users: totalUsers,
            pending: pendingLawyers,
            revenue: totalRevenue
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Stats failed" });
    }
});

// GET /api/admin/clients
router.get('/clients', verifyToken, async (req, res) => {
    try {
        const clients = await User.find({ role: 'client' }).select('-password');
        res.json(clients);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Fetch failed" });
    }
});

const nodemailer = require("nodemailer");

// POST /api/admin/request-access
router.post('/request-access', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const token = Math.random().toString(36).substring(2, 10).toUpperCase();

        // Send Email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER || "admin@nyaynow.in",
                pass: process.env.EMAIL_PASS || "demo"
            }
        });

        try {
            if (process.env.EMAIL_USER) {
                await transporter.sendMail({
                    from: "NyayNow Security <security@nyaynow.in>",
                    to: user.email,
                    subject: "Admin Access Token Request",
                    html: `<h3>Your Secure Access Token: ${token}</h3><p>Valid for 15 minutes.</p>`
                });
            } else {
                console.log(`[DEV] Admin Token for ${user.email}: ${token}`);
            }
        } catch (e) {
            console.error("Email failed:", e);
        }

        res.json({ message: "Token sent to registered email", devToken: token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Request failed" });
    }
});

module.exports = router;
