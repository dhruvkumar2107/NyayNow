const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const User = require("../models/User");
const Payment = require("../models/Payment");

const LEAD_COST_CREDITS = 2; // Cost in credits per lead acceptance

// ─── LEAD POOL (Get available leads) ─────────────────────────────────────────
router.get("/pool", async (req, res) => {
  try {
    const Case = require("../models/Case");
    const leads = await Case.find({ status: "open" })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("postedBy", "name city");

    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

// ─── ACCEPT LEAD (Costs credits for free-tier lawyers) ───────────────────────
router.post("/accept/:caseId", async (req, res) => {
  const verifyToken = require("../middleware/authMiddleware");

  try {
    const { caseId } = req.params;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role !== "lawyer") return res.status(403).json({ error: "Only lawyers can accept leads" });

    // Check if user has a paid listing tier (free leads) or needs credits
    const hasFreeLeads = ["standard", "premium"].includes(user.listingTier) ||
      ["pro", "firm", "silver", "gold", "diamond"].includes(user.plan);

    if (!hasFreeLeads) {
      // Check credits
      if (!user.credits || user.credits < LEAD_COST_CREDITS) {
        return res.status(402).json({
          error: `Insufficient credits. Accepting a lead costs ${LEAD_COST_CREDITS} credits.`,
          code: "INSUFFICIENT_CREDITS",
          creditsNeeded: LEAD_COST_CREDITS,
          currentCredits: user.credits || 0
        });
      }
      // Deduct credits
      await User.findByIdAndUpdate(userId, { $inc: { credits: -LEAD_COST_CREDITS } });
    }

    const Case = require("../models/Case");
    const caseDoc = await Case.findByIdAndUpdate(
      caseId,
      { lawyerId: userId, status: "accepted" },
      { new: true }
    );

    if (!caseDoc) return res.status(404).json({ error: "Case not found" });

    res.json({
      success: true,
      case: caseDoc,
      creditsDeducted: hasFreeLeads ? 0 : LEAD_COST_CREDITS,
      message: hasFreeLeads ? "Lead accepted (included in your plan)" : `Lead accepted. ${LEAD_COST_CREDITS} credits deducted.`
    });
  } catch (err) {
    console.error("Accept lead error:", err.message);
    res.status(500).json({ error: "Failed to accept lead" });
  }
});

module.exports = router;
