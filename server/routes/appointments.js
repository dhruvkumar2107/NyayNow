const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");
const verifyToken = require("../middleware/authMiddleware");

// Helper to create notification and emit socket event
const createNotification = async (io, userId, message, type, link) => {
    try {
        const notif = new Notification({ userId, message, type, link });
        await notif.save();
        if (io) {
            io.to(userId.toString()).emit("dashboard_alert", notif);
        }
    } catch (err) {
        console.error("Notification Creation Error:", err);
    }
};

// Book an appointment (Secure Client Link)
router.post("/", verifyToken, async (req, res) => {
    try {
        const { lawyerId, date, slot, notes } = req.body;
        const clientId = req.userId; // Securely identify client

        // Check availability (basic)
        const existing = await Appointment.findOne({ lawyerId, date, slot, status: "confirmed" });
        if (existing) {
            return res.status(400).json({ error: "Slot already booked" });
        }

        const lawyer = await User.findById(lawyerId);
        if (!lawyer) {
            return res.status(404).json({ error: "Lawyer not found" });
        }
        const fee = lawyer.consultationFee || lawyer.hourlyRate || 500;
        const commission = Math.round(fee * 0.15); // 15% platform commission

        const appointment = new Appointment({
            clientId,
            lawyerId,
            date,
            slot,
            notes,
            fee,
            commission,
            paymentStatus: "unpaid",
            status: "pending"
        });

        await appointment.save();

        // Notify the lawyer
        const client = await User.findById(clientId);
        await createNotification(
            req.io,
            lawyerId,
            `New appointment request from ${client?.name || "a client"} on ${date} at ${slot}`,
            "appointment",
            "/calendar"
        );

        res.json(appointment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Booking failed" });
    }
});

// List appointments (Secure Scoping)
router.get("/", verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const role = req.userRole;
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

// Update status (Secure Ownership check)
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const { status, meetingLink } = req.body;

        const existing = await Appointment.findById(req.params.id);
        if (!existing) return res.status(404).json({ error: "Not found" });

        // Only the lawyer or the client of this appointment can update/cancel it
        if (existing.lawyerId.toString() !== req.userId && existing.clientId.toString() !== req.userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const updated = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status, meetingLink },
            { new: true }
        ).populate("lawyerId", "name");

        if (updated) {
            // Notify the client
            await createNotification(
                req.io,
                updated.clientId,
                `Your appointment with ${updated.lawyerId?.name} has been ${status}`,
                "appointment",
                "/dashboard"
            );
        }

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
