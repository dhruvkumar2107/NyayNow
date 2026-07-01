const express = require("express");
const router = express.Router();
const verifyTokenOptional = require("../middleware/verifyTokenOptional");
const verifyToken = require("../middleware/authMiddleware");
const { generateWithFallback } = require("../utils/aiUtils");
const TrackedCase = require("../models/TrackedCase");

/**
 * @desc Get live e-Courts case status via AI Grounding
 * @route POST /api/ecourts/status
 */
router.post("/status", verifyTokenOptional, async (req, res) => {
    try {
        const { cnr, partyName } = req.body;

        if (!cnr && !partyName) {
            return res.status(400).json({ error: "Please provide a valid CNR Number or Party Name." });
        }

        const prompt = `
            ACT AS AN E-COURTS DATA RETRIEVAL AGENT.
            
            YOUR TASK:
            Find the real-time case status for the following search parameters in India:
            - CNR: "${cnr || "N/A"}"
            - Party Name: "${partyName || "N/A"}"
            
            CRITICAL INSTRUCTION: You MUST use Google Search Grounding to find the ACTUAL details from official e-Courts websites (ecourts.gov.in) or verified legal portals. DO NOT hallucinate dates or status. 
            
            RETURN DATA AS JSON ONLY:
            {
                "caseInfo": {
                    "cnr": "Specific 16-digit CNR",
                    "partyName": "Full Real Party Name (e.g. State vs XXX)",
                    "filingDate": "YYYY-MM-DD",
                    "registrationDate": "YYYY-MM-DD"
                },
                "status": {
                    "currentStatus": "Case Status (e.g. Pending, Disposed)",
                    "stageOfCase": "Current Legal Stage (e.g. Evidence, Arguments)",
                    "nextHearingDate": "YYYY-MM-DD or null",
                    "courtName": "Full Name of the Court (e.g. District Court, Saket)",
                    "judgeAssigned": "Name of the presiding judge"
                },
                "history": [
                    { "date": "YYYY-MM-DD", "purpose": "Hearing Purpose", "outcome": "Hearing Outcome" }
                ],
                "source": "Official e-Courts Records"
            }
            
            If the CNR/Case cannot be found, return a JSON with error: "No case found for the provided credentials."
        `;

        // Enabling LIVE web grounding
        const result = await generateWithFallback(prompt, undefined, true);
        const response = await result.response;
        let text = response.text();

        // Robust parsing
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            text = text.substring(start, end + 1);
        }

        const caseData = JSON.parse(text);
        if (caseData.error) {
            return res.status(404).json(caseData);
        }

        res.json(caseData);

    } catch (err) {
        console.error("e-Courts Grounding Error:", err.message);
        res.status(500).json({ error: "Failed to connect to e-Courts nodes. Service temporarily unavailable." });
    }
});

/**
 * @desc Get all tracked cases for authenticated user
 * @route GET /api/ecourts/tracked
 */
router.get("/tracked", verifyToken, async (req, res) => {
    try {
        const cases = await TrackedCase.find({ user: req.userId }).sort({ lastUpdated: -1 });
        res.json(cases);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch tracked cases" });
    }
});

/**
 * @desc Add case to tracking list
 * @route POST /api/ecourts/track
 */
router.post("/track", verifyToken, async (req, res) => {
    try {
        const { cnr, caseNumber, petitioner, respondent, court, judge, stage, status, nextHearing, history } = req.body;

        if (!cnr) return res.status(400).json({ error: "CNR number is required to track case" });

        // Check if already tracked
        const exists = await TrackedCase.findOne({ user: req.userId, cnr });
        if (exists) return res.status(400).json({ error: "You are already tracking this case." });

        const tracked = await TrackedCase.create({
            user: req.userId,
            cnr,
            caseNumber,
            petitioner,
            respondent,
            court,
            judge,
            stage,
            status,
            nextHearing,
            history
        });

        res.json({ message: "Case added to tracking list successfully", tracked });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add case to tracking" });
    }
});

/**
 * @desc Stop tracking a case
 * @route DELETE /api/ecourts/track/:id
 */
router.delete("/track/:id", verifyToken, async (req, res) => {
    try {
        await TrackedCase.findOneAndDelete({ _id: req.params.id, user: req.userId });
        res.json({ message: "Stopped tracking case successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to stop tracking case" });
    }
});

/**
 * @desc Trigger sync for a tracked case (forces fresh AI web query)
 * @route POST /api/ecourts/sync/:id
 */
router.post("/sync/:id", verifyToken, async (req, res) => {
    try {
        const trackedCase = await TrackedCase.findOne({ _id: req.params.id, user: req.userId });
        if (!trackedCase) return res.status(404).json({ error: "Tracked case not found" });

        const prompt = `
            ACT AS AN E-COURTS DATA RETRIEVAL AGENT.
            Find the real-time case status for CNR: "${trackedCase.cnr}"
            Use Google Grounding. Return JSON only with key status properties.
            {
                "status": {
                    "currentStatus": "Pending/Disposed",
                    "stageOfCase": "Stage name",
                    "nextHearingDate": "YYYY-MM-DD or null",
                    "courtName": "Court name",
                    "judgeAssigned": "Judge name"
                },
                "history": [
                    { "date": "YYYY-MM-DD", "purpose": "Hearing Purpose", "outcome": "Outcome" }
                ]
            }
        `;

        const result = await generateWithFallback(prompt, undefined, true);
        const response = await result.response;
        let text = response.text();

        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            text = text.substring(start, end + 1);
        }

        const caseData = JSON.parse(text);
        
        // Update DB entry
        trackedCase.status = caseData.status?.currentStatus || trackedCase.status;
        trackedCase.stage = caseData.status?.stageOfCase || trackedCase.stage;
        trackedCase.nextHearing = caseData.status?.nextHearingDate || trackedCase.nextHearing;
        trackedCase.court = caseData.status?.courtName || trackedCase.court;
        trackedCase.judge = caseData.status?.judgeAssigned || trackedCase.judge;
        if (caseData.history && caseData.history.length > 0) {
            trackedCase.history = caseData.history;
        }
        trackedCase.lastUpdated = new Date();

        await trackedCase.save();
        res.json({ message: "Synced successfully", tracked: trackedCase });

    } catch (err) {
        console.error("Sync Error:", err.message);
        res.status(500).json({ error: "Sync failed. Please try again later." });
    }
});

module.exports = router;
