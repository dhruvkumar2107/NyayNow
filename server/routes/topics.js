const express = require("express");
const router = express.Router();
const Topic = require("../models/Topic");

router.get("/", async (req, res) => {
    try {
        const topics = await Topic.find().sort({ count: -1 }).limit(5);
        res.json(topics);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch topics" });
    }
});

// Seed/Create route (for demo purposes)
router.post("/", async (req, res) => {
    try {
        const topic = await Topic.create(req.body);
        res.json(topic);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
