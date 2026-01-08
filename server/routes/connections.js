const express = require("express");
const router = express.Router();
const Connection = require("../models/Connection");
const User = require("../models/User");

// GET /api/connections?userId=...
// Fetch all active connections for a user
router.get("/", async (req, res) => {
    const { userId } = req.query;
    try {
        const connections = await Connection.find({
            $or: [{ clientId: userId }, { lawyerId: userId }],
            status: "active"
        })
            .populate("clientId", "name email phone role location plan")
            .populate("lawyerId", "name email phone role specialization location plan");

        // return the *other* person's profile
        const profiles = connections.map(c => {
            const isClient = c.clientId._id.toString() === userId;
            return isClient ? c.lawyerId : c.clientId;
        });

        res.json(profiles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch connections" });
    }
});

// POST /api/connections
// Request a connection
router.post("/", async (req, res) => {
    const { clientId, lawyerId, initiatedBy } = req.body;
    try {
        const existing = await Connection.findOne({ clientId, lawyerId });
        if (existing) {
            if (existing.status === "active") return res.status(400).json({ error: "Already connected" });
            if (existing.status === "pending") return res.status(400).json({ error: "Request already sending" });
        }

        // Auto-accept for now to simplify (or "active" immediately for "Real" feel)
        // In a strict world, this would be 'pending'. 
        // Given user reuqest "this connect should work", let's make it auto-active for instant messaging gratification,
        // OR we can make it pending if they want an approval flow.
        // Let's stick to 'active' for immediate "Real" connection unless specified otherwise.
        // actually, typically 'connect' implies a handshake. But 'leads' are accepted.
        // Let's set to 'active' for simplicity based on "connect should work".

        const newConn = new Connection({
            clientId,
            lawyerId,
            initiatedBy,
            status: "active"
        });

        await newConn.save();
        res.json(newConn);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to connect" });
    }
});

module.exports = router;
