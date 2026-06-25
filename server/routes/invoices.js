const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const verifyToken = require("../middleware/authMiddleware");

// Create Invoice
router.post("/", verifyToken, async (req, res) => {
    try {
        if (req.userRole !== 'lawyer') return res.status(403).json({ error: "Only lawyers can generate invoices" });

        const newInv = new Invoice({
            ...req.body,
            lawyerId: req.userId
        });
        await newInv.save();
        res.json(newInv);
    } catch (err) {
        res.status(500).json({ error: "Failed to create invoice" });
    }
});

// Get Invoices (Scoped to User)
router.get("/", verifyToken, async (req, res) => {
    try {
        let query = {};
        if (req.userRole === 'lawyer') {
            query.lawyerId = req.userId;
        } else {
            query.clientId = req.userId;
        }

        const invoices = await Invoice.find(query).sort({ createdAt: -1 });
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch invoices" });
    }
});

// Update Invoice (Secure ownership check)
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const inv = await Invoice.findById(req.params.id);
        if (!inv) return res.status(404).json({ error: "Not found" });

        // Only the lawyer who created it or the client (to mark paid) can touch it
        // For now, let's say only lawyer can update details
        if (inv.lawyerId.toString() !== req.userId && req.userRole !== 'admin') {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const updated = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: "Failed to update" });
    }
});

module.exports = router;
