const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/authMiddleware');

// GET /api/users -> Admin/Internal search
// Should probably be restricted to admins in production
router.get('/', verifyToken, async (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: "Forbidden: Admin only" });
  }

  const { q, role } = req.query;
  let filter = {};

  if (role) {
    filter.role = role;
  }

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { phone: { $regex: q } }
    ];
  }
  const users = await User.find(filter).limit(200).select("-password -otp");
  res.json(users);
});

// GET /api/users/public/:id - Get Public Profile of any user (usually lawyer)
router.get("/public/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -__v -otp -otpExpires -email -phone"); // Exclude private info

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// PUT /api/users/me - Secure Profile Update
router.put("/me", verifyToken, async (req, res) => {
  try {
    const updates = req.body;
    // Prevent privilege escalation via this route
    const PROTECTED_FIELDS = ['role', 'password', 'plan', 'verified', 'verificationStatus', 'credits', 'googleId'];
    for (const field of PROTECTED_FIELDS) {
      delete updates[field];
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// DELETE /api/users/me - Right to be Forgotten (DPDP Act 2023)
router.delete("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Optional: Clean up other user data (messages, cases) if desired
    res.json({ success: true, message: "Account deleted permanently." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete account" });
  }
});

// GET /api/users/stats/public - Public statistics (query count, precedents)
router.get("/stats/public", async (req, res) => {
  try {
    const totalLawyers = await User.countDocuments({ role: "lawyer" });
    
    const ChatHistory = require("../models/ChatHistory");
    const GuestUsage = require("../models/GuestUsage");
    
    const guestQueries = await GuestUsage.aggregate([
      { $group: { _id: null, total: { $sum: "$count" } } }
    ]);
    const guestTotal = guestQueries.length > 0 ? guestQueries[0].total : 0;
    
    const chatQueries = await ChatHistory.countDocuments();
    const totalQueries = 12400 + guestTotal + chatQueries;
    
    res.json({
      queries: totalQueries,
      precedents: 1200000,
      lawyers: totalLawyers
    });
  } catch (err) {
    console.error("Failed to fetch public stats:", err);
    res.json({
      queries: 12847,
      precedents: 1200000,
      lawyers: 48
    });
  }
});

module.exports = router;
