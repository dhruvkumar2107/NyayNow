const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");

// MOCK: Search Case by CNR or Case Number
router.get("/search", verifyToken, async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ error: "Please enter a Case Number or CNR Number" });
        }

        // SIMULATED LATENCY (To make it feel real)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // MOCK RESPONSE
        const mockCase = {
            cnr: "MHNB010045622024",
            caseNumber: query.toUpperCase(),
            filingDate: "2024-02-14",
            petitioner: "Rajesh Kumar & Ors.",
            respondent: "State of Maharashtra",
            status: "Pending",
            nextHearing: "2024-03-22",
            judge: "Hon. Justice A.K. Menon",
            court: "Bombay High Court",
            stage: "Cross Examination",
            acts: ["IPC 420", "IPC 34"],
            history: [
                { date: "2024-02-14", action: "Case Filed", outcome: "Admitted" },
                { date: "2024-02-28", action: "First Hearing", outcome: "Notice Issued" },
                { date: "2024-03-10", action: "Evidence", outcome: "Adjourned" }
            ]
        };

        res.json(mockCase);
    } catch (err) {
        console.error("eCourt Search Error:", err);
        res.status(500).json({ error: "Failed to fetch court data" });
    }
});

module.exports = router;
