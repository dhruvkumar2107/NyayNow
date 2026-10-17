const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const Agreement = require("../models/Agreement");

// SAVE AGREEMENT
router.post("/", verifyToken, async (req, res) => {
    try {
        const { type, content, parties } = req.body;

        const newAgreement = new Agreement({
            userId: req.userId,
            type,
            content,
            parties
        });

        const saved = await newAgreement.save();
        res.json(saved);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save agreement" });
    }
});

// GET MY AGREEMENTS
router.get("/", verifyToken, async (req, res) => {
    try {
        const agreements = await Agreement.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(agreements);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch agreements" });
    }
});
// Do not simulate Aadhaar eSign. No authorized eSign provider or verification
// integration is configured in this application.
router.post("/sign/:id", verifyToken, async (req, res) => {
    return res.status(501).json({ code: "ESIGN_UNAVAILABLE", error: "Electronic signing is not available. NyayNow has no configured Aadhaar eSign integration." });
});

module.exports = router;
