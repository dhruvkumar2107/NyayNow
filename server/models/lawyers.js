const express = require("express");
const Lawyer = require("../models/Lawyer");

const router = express.Router();

/**
 * GET /api/lawyers
 * Fetch all lawyers
 */
router.get("/", async (req, res) => {
  try {
    const lawyers = await Lawyer.find().sort({ experience: -1 });
    res.json(lawyers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch lawyers" });
  }
});

/**
 * POST /api/lawyers
 * Add lawyer (for testing / seeding)
 */
router.post("/", async (req, res) => {
  try {
    const lawyer = new Lawyer(req.body);
    await lawyer.save();
    res.json(lawyer);
  } catch (err) {
    res.status(400).json({ error: "Failed to add lawyer" });
  }
});

module.exports = router;
