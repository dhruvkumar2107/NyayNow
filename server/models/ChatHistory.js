const mongoose = require("mongoose");

const ChatHistorySchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, default: "New Conversation" },
        messages: [
            {
                role: { type: String, enum: ["user", "model", "system"], required: true },
                text: { type: String, required: true },
                timestamp: { type: Date, default: Date.now }
            }
        ]
    },
    { timestamps: true }
);

module.exports = mongoose.model("ChatHistory", ChatHistorySchema);
