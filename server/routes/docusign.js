const express = require("express");
const router = express.Router();
const { createEnvelope, getSigningUrl } = require("../utils/docusign");

// POST /api/docusign/sign
router.post("/sign", async (req, res) => {
    try {
        const { email, name, documentBase64, returnUrl } = req.body;

        if (!email || !name || !documentBase64) {
            return res.status(400).json({ error: "Missing required fields" });
        }

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
