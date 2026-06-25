const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: {
        type: String,
        enum: ['hearing', 'meeting', 'deadline', 'personal'],
        default: 'meeting'
    },
    start: { type: Date, required: true },
    end: { type: Date, required: true },

    // Participants
    lawyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Link to a specific case (optional)
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },

    description: String,
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' }
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
