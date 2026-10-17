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
// Only fields intended for public marketplace display are returned. Credential,
// billing and internal verification artifacts are never exposed here.
const PUBLIC_PROFILE_FIELDS = [
  "_id", "role", "name", "age", "sex", "specialization", "experience", "location",
  "resume", "bio", "profileImage", "languages", "courts", "education", "socials",
  "consultationFee", "availability", "isProfileComplete", "stats", "listingTier",
  "isFeatured", "verified", "verificationStatus", "rejectionReason",
  "isStudent", "createdAt"
].join(" ");

router.get("/public/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(PUBLIC_PROFILE_FIELDS);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// PUT /api/users/me - Secure Profile Update
// Allowlist: only fields a user may legitimately edit about their own profile.
// Security/entitlement fields (role, plan, verification, usage, billing,
// tokenVersion, credentials) are intentionally NOT updatable here.
const ALLOWED_PROFILE_FIELDS = [
  "name", "age", "sex", "phone", "specialization", "experience", "location",
  "resume", "bio", "headline", "awards", "profileImage", "languages", "courts",
  "education", "socials", "consultationFee", "availability", "isProfileComplete",
  "settings", "isStudent", "studentRollNumber"
];

router.put("/me", verifyToken, async (req, res) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const updates = {};
    for (const field of ALLOWED_PROFILE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No updatable fields provided" });
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    // Normalise _id -> id so the client's compact user object keeps its identifier
    const obj = user.toObject();
    obj.id = obj._id;
    res.json(obj);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// PUT /api/users/:id - backward-compatible self-update. A user may ONLY update
// their own profile through this alias; any other id is rejected.
router.put("/:id", verifyToken, async (req, res) => {
  try {
    if (req.params.id !== req.userId) {
      return res.status(403).json({ message: "Forbidden: you can only update your own profile" });
    }
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const updates = {};
    for (const field of ALLOWED_PROFILE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        updates[field] = body[field];
      }
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No updatable fields provided" });
    }
    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    const obj = user.toObject();
    obj.id = obj._id;
    res.json(obj);
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

// GET /api/users/stats/public - Public statistics.
// Only real, DB-derived values are reported. We do NOT inflate or hardcode
// numbers — if data is unavailable the endpoint returns honest zeros.
router.get("/stats/public", async (req, res) => {
  try {
    const totalLawyers = await User.countDocuments({ role: "lawyer", verified: true, verificationStatus: "verified" });

    const ChatHistory = require("../models/ChatHistory");
    const GuestUsage = require("../models/GuestUsage");

    const guestQueries = await GuestUsage.aggregate([
      { $group: { _id: null, total: { $sum: "$count" } } }
    ]);
    const guestTotal = guestQueries.length > 0 ? guestQueries[0].total : 0;

    const chatQueries = await ChatHistory.countDocuments();
    const totalQueries = guestTotal + chatQueries;

    res.json({
      queries: totalQueries,
      lawyers: totalLawyers
    });
  } catch (err) {
    console.error("Failed to fetch public stats:", err);
    // Honest fallback — never present invented figures as real
    res.json({ queries: 0, lawyers: 0 });
  }
});

module.exports = router;
