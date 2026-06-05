const express = require("express");
const router = express.Router();
const Case = require("../models/Case");
const User = require("../models/User");
const verifyToken = require("../middleware/authMiddleware");

// CREATE CASE (Securely linked to Client)
router.post("/", verifyToken, async (req, res) => {
  try {
    const c = new Case({
      ...req.body,
      client: req.userId // Force ownership
    });
    await c.save();

    // Broadcast to all lawyers in the pool
    if (req.io) {
      req.io.to("lawyer_pool").emit("dashboard_alert", {
        message: `New Legal Matter: ${c.title}`,
        type: 'lead',
        link: '/leads'
      });
    }

    res.json(c);
  } catch (err) {
    res.status(500).json({ error: "Failed to post case" });
  }
});
// GET ALL CASES (Scoped to User Role)
router.get("/", verifyToken, async (req, res) => {
  const { open } = req.query;
  let query = {};

  // Clients only see their own cases
  if (req.userRole === 'client') {
    query.client = req.userId;
  }
  // Lawyers see cases they've accepted, or ALL open cases if requesting the lead pool
  else if (req.userRole === 'lawyer') {
    if (open === "true") {
      query.acceptedBy = null; // Lead pool
    } else {
      query.lawyer = req.userId; // Their active matters
    }
  }

  try {
    const cases = await Case.find(query).sort({ postedAt: -1 });
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cases" });
  }
});
const Connection = require("../models/Connection");

// LAWYER ACCEPTS CASE (Securely linked)
router.post("/:id/accept", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { lawyerPhone } = req.body;

  if (req.userRole !== 'lawyer') return res.status(403).json({ error: "Access denied" });

  try {
    const freshCase = await Case.findById(id);
    if (!freshCase) return res.status(404).json({ error: "Case not found" });
    if (freshCase.lawyer) return res.status(400).json({ error: "Case already accepted" });

    const updates = { acceptedBy: lawyerPhone, stage: 'Discovery', lawyer: req.userId };

    // Auto-create Connection
    if (freshCase.client) {
      await Connection.findOneAndUpdate(
        { clientId: freshCase.client, lawyerId: req.userId },
        { status: "active", initiatedBy: req.userId },
        { upsert: true, new: true }
      );
    }

    const c = await Case.findByIdAndUpdate(id, updates, { new: true });
    res.json(c);
  } catch (err) {
    console.error("Accept Lead Error:", err);
    res.status(500).json({ error: "Failed to accept lead" });
  }
});

// KANBAN STAGE UPDATE (Secure ownership)
router.patch("/:id/stage", verifyToken, async (req, res) => {
  try {
    const { stage } = req.body;
    const existing = await Case.findById(req.params.id);

    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.lawyer?.toString() !== req.userId) return res.status(403).json({ error: "Only the assigned lawyer can update stages" });

    const c = await Case.findByIdAndUpdate(req.params.id, { stage }, { new: true }).populate('client');

    // Notify the client about stage change
    if (c && c.client && req.io) {
      const Notification = require("../models/Notification");
      const notif = new Notification({
        userId: c.client._id,
        message: `Case Update: Your matter "${c.title}" has moved to ${stage}`,
        type: 'case',
        link: '/dashboard'
      });
      await notif.save();
      req.io.to(c.client._id.toString()).emit("dashboard_alert", notif);
    }

    res.json(c);
  } catch (err) {
    res.status(500).json({ error: "Failed to update stage" });
  }
});

// TIMELINE UPDATE (Secure ownership)
router.post("/:id/timeline", verifyToken, async (req, res) => {
  try {
    const { title, status, desc } = req.body;
    const c = await Case.findById(req.params.id);

    if (!c) return res.status(404).json({ error: "Not found" });
    if (c.lawyer?.toString() !== req.userId) return res.status(403).json({ error: "Unauthorized" });

    c.timeline.push({ title, status, desc, date: new Date() });
    await c.save();
    res.json(c);
  } catch (err) {
    res.status(500).json({ error: "Failed to add timeline event" });
  }
});

module.exports = router;
