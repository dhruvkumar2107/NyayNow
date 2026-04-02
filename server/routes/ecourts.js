const express = require("express");
const router = express.Router();
const verifyTokenOptional = require("../middleware/verifyTokenOptional");
const { generateWithFallback } = require("../utils/aiUtils");

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

module.exports = router;

module.exports = router;
