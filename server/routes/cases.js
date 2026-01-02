const express = require("express");
const router = express.Router();
const Case = require("../models/Case");
// CREATE CASE
router.post("/", async (req, res) => {
  const c = new Case(req.body);
  await c.save();
  res.json(c);
});
// GET ALL CASES (With Filters)
router.get("/", async (req, res) => {
  const { postedBy, open } = req.query;
  let query = {};

  if (postedBy) query.postedBy = postedBy;
  if (open === "true") query.acceptedBy = null;

  try {
    const cases = await Case.find(query).sort({ postedAt: -1 });
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cases" });
  }
});
// LAWYER ACCEPTS CASE
router.post("/:id/accept", async (req, res) => {
  const { id } = req.params;
  const { lawyerPhone } = req.body;
  const c = await Case.findByIdAndUpdate(
    id,
    { acceptedBy: lawyerPhone },
    { new: true }
  );
  res.json(c);
});
module.exports = router;
