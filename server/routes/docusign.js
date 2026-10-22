const express = require("express");
const router = express.Router();
const { createEnvelope, getSigningUrl } = require("../utils/docusign");
const verifyToken = require("../middleware/authMiddleware");
const User = require("../models/User");

// POST /api/docusign/sign
router.post("/sign", verifyToken, async (req, res) => {
    try {
        const { documentBase64, returnUrl } = req.body;

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (!documentBase64) {
            return res.status(400).json({ error: "Missing document" });
        }

        const name = user.name;
        const email = user.email;

        // 1. Create Envelope
        const envelopeId = await createEnvelope(email, name, documentBase64);

        // 2. Get Signing URL
        // In prod, this URL lets the user sign the document inside an iframe or new tab
        const signingUrl = await getSigningUrl(envelopeId, returnUrl || "http://localhost:5173/drafting-lab");

        res.json({ success: true, envelopeId, signingUrl });
    } catch (err) {
        console.error("DocuSign Error:", err);
        res.status(500).json({ error: "Failed to create signing session" });
    }
});

module.exports = router;
