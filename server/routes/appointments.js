const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/User");

// POST /api/appointments
// Book an appointment
router.post("/", async (req, res) => {
    try {
        const { clientId, lawyerId, date, slot, notes } = req.body;

        // Check availability (basic)
        const existing = await Appointment.findOne({ lawyerId, date, slot, status: "confirmed" });
        if (existing) {
            return res.status(400).json({ error: "Slot already booked" });
        }

        const appointment = new Appointment({
            clientId,
            lawyerId,
            date,
            slot,
            notes
        });

        await appointment.save();
        res.json(appointment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Booking failed" });
    }
});

// GET /api/appointments?userId=...&role=...
// List appointments
router.get("/", async (req, res) => {
    try {
        const { userId, role } = req.query;
        const filter = role === "lawyer" ? { lawyerId: userId } : { clientId: userId };

        const appointments = await Appointment.find(filter)
            .populate("clientId", "name email phone")
            .populate("lawyerId", "name specialization location")
            .sort({ date: 1, slot: 1 });

        res.json(appointments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Fetch failed" });
    }
});

// PUT /api/appointments/:id
// Update status
router.put("/:id", async (req, res) => {
    try {
        const { status, meetingLink } = req.body;
        const updated = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status, meetingLink },
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Update failed" });
    }
});

// GET /api/appointments/booked-slots
// Get booked slots for a lawyer on a specific date
router.get("/booked-slots", async (req, res) => {
    try {
        const { lawyerId, date } = req.query;
        if (!lawyerId || !date) return res.status(400).json({ error: "Missing parameters" });

        const appointments = await Appointment.find({ lawyerId, date, status: { $ne: "cancelled" } });
        const bookedSlots = appointments.map(a => a.slot);

        res.json(bookedSlots);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch slots" });
    }
});

module.exports = router;
