const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");

// Initialize Gemini
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// REALISTIC AI CASE GENERATOR
router.get("/search", verifyToken, async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: "Please enter a Case Number or CNR Number" });
        }

        const prompt = `
            Generate a REALISTIC Indian Court Case Status based on this query: "${query}".
            
            Context:
            - If query looks like a CNR (e.g. MHNB01...), generate details for that specific state.
            - If query is a random number, invent a plausible case (Civil/Criminal).
            - Use varied names (Not just Rajesh Kumar).
            - Status should be plausible (Pending, Disposed, Evidence Stage).
            
            Output JSON Strict:
            {
                "cnr": "${query.length > 10 ? query : 'MHNB0100' + Math.floor(Math.random() * 100000)}",
                "caseNumber": "${query.toUpperCase()}",
                "filingDate": "YYYY-MM-DD",
                "petitioner": "Name vs. Name",
                "respondent": "State/Company/Individual",
                "status": "Pending/Disposed/Stayed",
                "nextHearing": "YYYY-MM-DD",
                "judge": "Hon. Justice [Name]",
                "court": "[City] District Court / High Court",
                "stage": "Evidence/Arguments/Notice",
                "acts": ["IPC 420", "Section 138 NI Act"],
                "history": [
                    {"date": "...", "action": "Filing", "outcome": "Admitted"},
                    {"date": "...", "action": "Hearing", "outcome": "Adjourned"}
                ]
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            text = text.substring(jsonStart, jsonEnd + 1);
        }

        res.json(JSON.parse(text));

    } catch (err) {
        console.error("eCourt AI Gen Error:", err.message);
        // Fallback to static if AI fails
        res.json({
            cnr: "MHNB010045622024",
            caseNumber: query?.toUpperCase() || "CASE/123/2024",
            petitioner: "AI Service Unavailable",
            status: "Error fetching live data",
            court: "Server Busy",
            history: []
        });
    }
});

module.exports = router;
