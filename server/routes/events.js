const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Event = require('../models/Event');
const verifyToken = require('../middleware/authMiddleware');

// GET EVENTS (Unified: Custom Events + Appointments)
router.get('/', verifyToken, async (req, res) => {
    const userId = req.userId;
    const { type } = req.query;
    try {
        const query = { $or: [{ lawyer: userId }, { client: userId }] };
        if (type) query.type = type;

        // 1. Fetch Custom Events
        const events = await Event.find(query).sort({ start: 1 }).populate('client lawyer', 'name email');

        // 2. Fetch Appointments for the same user
        const aptQuery = { $or: [{ lawyerId: userId }, { clientId: userId }] };
        const appointments = await Appointment.find(aptQuery).populate('clientId lawyerId', 'name email');

        // 3. Normalize Appointments to Event structure
        const mappedApts = appointments.map(apt => ({
            _id: apt._id,
            title: `Consultation with ${apt.clientId?.name || 'Client'}`,
            type: 'meeting',
            start: new Date(`${apt.date} ${apt.slot}`), // Naive conversion
            end: new Date(new Date(`${apt.date} ${apt.slot}`).getTime() + 60 * 60 * 1000), // Assume 1hr
            status: apt.status,
            lawyer: apt.lawyerId,
            client: apt.clientId,
            isAppointment: true // Flag
        }));

        // 4. Merge and Sort
        const unified = [...events, ...mappedApts].sort((a, b) => new Date(a.start) - new Date(b.start));

        res.json(unified);
    } catch (err) {
        console.error("Calendar Fetch Error:", err);
        res.status(500).json({ error: "Failed to fetch events" });
    }
});

// CREATE EVENT (Secure Ownership)
router.post('/', verifyToken, async (req, res) => {
    try {
        const eventData = {
            ...req.body,
            [req.userRole]: req.userId // Force self as participant
        };
        const event = new Event(eventData);
        await event.save();
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: "Failed to create event" });
    }
});

// UPDATE STATUS (Secure Ownership)
router.patch('/:id/status', verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: "Event not found" });

        // Check if user is participant
        if (event.lawyer?.toString() !== req.userId && event.client?.toString() !== req.userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        event.status = status;
        await event.save();
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
});

module.exports = router;
