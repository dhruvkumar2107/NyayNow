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
// MOCK AADHAAR ESIGN
router.post("/sign/:id", verifyToken, async (req, res) => {
    try {
        const agreement = await Agreement.findOne({ _id: req.params.id, userId: req.userId });
        if (!agreement) return res.status(404).json({ error: "Agreement not found" });

        // Simulate Aadhaar API Latency
        await new Promise(resolve => setTimeout(resolve, 2000));

        agreement.isSigned = true;
        agreement.signatureDate = new Date();
        agreement.signerName = req.body.signerName || "Authorized User";
        agreement.aadhaarTxId = "UIDAI-" + Math.random().toString(36).substr(2, 9).toUpperCase();

        await agreement.save();
        res.json(agreement);
    } catch (err) {
        console.error("eSign Error:", err);
        res.status(500).json({ error: "Failed to sign agreement" });
    }
});

module.exports = router;
