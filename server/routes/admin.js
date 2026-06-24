const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const Payment = require('../models/Payment'); // Make sure this model exists
const verifyToken = require('../middleware/authMiddleware');

// In-memory store for admin access tokens (hash → expiresAt)
const adminTokenStore = new Map(); // userId → { hash, expiresAt }
const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

// GET /api/admin/stats
router.get('/stats', verifyToken, async (req, res) => {
    try {
        if (req.userRole !== 'admin') return res.status(403).json({ error: "Access denied" });

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
        if (req.userRole !== 'admin') return res.status(403).json({ error: "Access denied" });
        const clients = await User.find({ role: 'client' }).select('-password');
        res.json(clients);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Fetch failed" });
    }
});

// GET /api/admin/pending-lawyers
router.get('/pending-lawyers', verifyToken, async (req, res) => {
    try {
        if (req.userRole !== 'admin') return res.status(403).json({ error: "Access denied" });
        const lawyers = await User.find({ role: 'lawyer', verified: false }).select('-password');
        res.json(lawyers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Fetch pending failed" });
    }
});

// POST /api/admin/verify-lawyer/:id
router.post('/verify-lawyer/:id', verifyToken, async (req, res) => {
    try {
        if (req.userRole !== 'admin') return res.status(403).json({ error: "Access denied" });
        const { status } = req.body; // 'approved' or 'rejected'
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ error: "User not found" });

        if (status === 'approved') {
            user.verified = true;
            user.verificationStatus = 'verified';
        } else if (status === 'rejected') {
            user.verified = false;
            user.verificationStatus = 'rejected';
            // Optionally delete ID card image
            user.idCardImage = "";
        }

        await user.save();
        res.json({ message: `Lawyer ${status} successfully`, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Verification update failed" });
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

        const token = crypto.randomBytes(32).toString('hex');
        const hash = crypto.createHash('sha256').update(token).digest('hex');

        // Store hash server-side with expiry
        adminTokenStore.set(req.userId, { hash, expiresAt: Date.now() + ACCESS_TOKEN_TTL_MS });

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("⚠️ Nodemailer credentials missing. Access token printed to server log.");
            console.log(`[ACCESS TOKEN] ${user.email} -> ${token}`);
            const devResponse = { message: "Token generated (check server logs)" };
            if (process.env.NODE_ENV === 'development') {
                devResponse.devToken = token;
            }
            return res.json(devResponse);
        }

        // Send Email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        try {
            await transporter.sendMail({
                from: "NyayNow Security <security@nyaynow.in>",
                to: user.email,
                subject: "Admin Access Token Request",
                html: `<h3>Your Secure Access Token: ${token}</h3><p>Valid for 15 minutes.</p>`
            });
        } catch (e) {
            console.error("Email failed:", e);
            return res.status(500).json({ error: "Failed to send access email" });
        }

        const responseData = { message: "Token sent to registered email" };
        if (process.env.NODE_ENV === 'development') {
            responseData.devToken = token;
        }
        res.json(responseData);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Request failed" });
    }
});

// POST /api/admin/verify-access — validates the emailed token server-side
router.post('/verify-access', verifyToken, async (req, res) => {
    try {
        if (req.userRole !== 'admin') return res.status(403).json({ error: "Forbidden" });
        const { token } = req.body;
        if (!token || typeof token !== 'string') {
            return res.status(400).json({ error: "Token required" });
        }
        const entry = adminTokenStore.get(req.userId);
        if (!entry || Date.now() > entry.expiresAt) {
            adminTokenStore.delete(req.userId);
            return res.status(401).json({ error: "Token expired or not found. Request a new one." });
        }
        const hash = crypto.createHash('sha256').update(token).digest('hex');
        if (hash !== entry.hash) {
            return res.status(401).json({ error: "Invalid token" });
        }
        adminTokenStore.delete(req.userId); // one-time use
        res.json({ success: true, message: "Access verified" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Verification failed" });
    }
});

module.exports = router;
