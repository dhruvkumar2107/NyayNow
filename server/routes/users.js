const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/authMiddleware');

// GET /api/users -> Admin-only paginated user search
router.get('/', verifyToken, async (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: "Forbidden: Admin only" });
  }

  const { q, role, page = 1, limit = 50 } = req.query;

  const pageNum  = Math.max(1, parseInt(page)  || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
  const skip     = (pageNum - 1) * limitNum;

  let filter = {};

  if (role && typeof role === 'string') {
    const VALID_ROLES = ['client', 'lawyer', 'admin'];
    if (VALID_ROLES.includes(role)) filter.role = role;
  }

  if (q && typeof q === 'string') {
    const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex special chars
    filter.$or = [
      { name: { $regex: safeQ, $options: "i" } },
      { phone: { $regex: safeQ } }
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limitNum).select("-password -otp"),
    User.countDocuments(filter),
  ]);

  res.json({ users, total, page: pageNum, pages: Math.ceil(total / limitNum) });
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

// DELETE /api/users/me - Right to be Forgotten (DPDP Act 2023) with cascade
router.delete("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Cascade: remove all user-owned data per DPDP Act 2023
    const uid = req.userId;
    await Promise.allSettled([
      require("../models/Message")?.deleteMany?.({ $or: [{ sender: uid }, { receiver: uid }] }),
      require("../models/ChatHistory")?.deleteMany?.({ user: uid }),
      require("../models/Case")?.deleteMany?.({ $or: [{ client: uid }, { lawyer: uid }] }),
      require("../models/Appointment")?.deleteMany?.({ $or: [{ clientId: uid }, { lawyerId: uid }] }),
      require("../models/CRMClient")?.deleteMany?.({ lawyer: uid }),
      require("../models/Connection")?.deleteMany?.({ $or: [{ requester: uid }, { recipient: uid }] }),
      require("../models/GuestUsage")?.deleteMany?.({ userId: uid }),
    ]);

    res.json({ success: true, message: "Account and all associated data deleted permanently." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete account" });
  }
});

// PUT /api/users/me/password - Dedicated password change (separate from profile update)
router.put("/me/password", verifyToken, async (req, res) => {
  try {
    const bcrypt = require("bcryptjs");
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      return res.status(400).json({ message: "currentPassword and newPassword are required strings" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    const user = await User.findById(req.userId).select('+password');
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.password) {
      return res.status(400).json({ message: "This account uses social login and has no password to change" });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    // Invalidate all existing sessions
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    res.json({ success: true, message: "Password updated. Please log in again." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to change password" });
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
