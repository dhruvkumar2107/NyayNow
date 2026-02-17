const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { createVerificationRequest, getVerificationStatus } = require('../utils/digilocker');

// POST /api/verification/initiate-digilocker
// Called when user clicks "Verify with DigiLocker"
router.post('/initiate-digilocker', async (req, res) => {
    try {
        const { userId } = req.body;
        // The URL the user comes back to after verifying on Gov portal
        const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verification-callback`;

        const data = await createVerificationRequest(redirectUrl);

        // data.url is the Setu/DigiLocker page URL
        // data.id is the request ID which we should verify later

        // Save requestId to user so we can verify it later
        if (userId) {
            await User.findByIdAndUpdate(userId, {
                verificationRequestId: data.id
            });
        }

        res.json({ url: data.url, requestId: data.id });
    } catch (err) {
        console.error("DigiLocker Init Error:", err.message);
        res.status(500).json({ error: "Failed to connect to DigiLocker Provider. Check API Keys." });
    }
});

// POST /api/verification/verify-status
// Called by frontend after redirect return to confirm success
router.post('/verify-status', async (req, res) => {
    try {
        const { userId, requestId } = req.body;

        const data = await getVerificationStatus(requestId);

        if (data.status === 'success') {
            // Success! We have the data.
            // Update User to Verified
            await User.findByIdAndUpdate(userId, {
                verified: true,
                verificationStatus: 'verified',
                barCouncilId: `AADHAAR-VERIFIED-${data.aadhaar_number?.slice(-4)}`
            });

            res.json({ success: true, name: data.name });
        } else {
            res.status(400).json({ success: false, status: data.status });
        }

    } catch (err) {
        console.error("Verification Check Error:", err.message);
        res.status(500).json({ error: "Could not fetch verification status" });
    }
});

module.exports = router;
