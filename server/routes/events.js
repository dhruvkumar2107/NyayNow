const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

const Appointment = require('../models/Appointment');

// GET EVENTS (Unified: Custom Events + Appointments)
router.get('/', async (req, res) => {
    const { userId, type } = req.query;
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

// CREATE EVENT
router.post('/', async (req, res) => {
    try {
        const event = new Event(req.body);
        await event.save();
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: "Failed to create event" });
    }
});

// UPDATE STATUS (e.g., Complete/Cancel)
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const event = await Event.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
});

module.exports = router;
