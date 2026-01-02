const express = require("express");
const User = require("../models/User");

const router = express.Router();

/* ---------------- GET ALL LAWYERS ---------------- */
router.get("/", async (req, res) => {
    try {
        // 1. Fetch only lawyers
        // 2. Ideally, we should add pagination, but for now fetch all
        const lawyers = await User.find({ role: "lawyer" })
            .select("-password") // Exclude password from results
            .limit(50); // Safety limit

        res.json(lawyers);
    } catch (err) {
        console.error("Error fetching lawyers:", err.message);
        res.status(500).json({ error: "Failed to fetch lawyers" });
    }
});

module.exports = router;
