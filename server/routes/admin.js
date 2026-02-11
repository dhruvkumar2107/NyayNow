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

module.exports = router;
