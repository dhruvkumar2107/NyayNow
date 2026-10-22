const mongoose = require("mongoose");

const confessionSchema = new mongoose.Schema(
    {
        // Issue posted anonymously
        title: { type: String, required: true, maxlength: 150 },
        body: { type: String, required: true, maxlength: 2000 },
        category: {
            type: String,
            enum: [
                "Criminal", "Family", "Property", "Consumer", "Employment",
                "Cyber", "Tenant", "Business", "Financial", "Other"
            ],
            default: "Other"
        },

        // Always anonymous — no author reference stored publicly
        // Stored only for moderation / abuse tracking (not returned to frontend)
        _anonToken: { type: String, required: true, index: true },

        // AI preliminary analysis (auto-generated on post)
        aiAnalysis: { type: String, default: "" },

        // Community responses from lawyers (anonymous display name)
        replies: [
            {
                responderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                responderRole: { type: String, enum: ["lawyer", "client", "ai"], default: "lawyer" },
                text: { type: String, required: true, maxlength: 1500 },
                helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // upvotes
                createdAt: { type: Date, default: Date.now }
            }
        ],

        // Engagement
        views: { type: Number, default: 0 },
        upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        tags: [String],

        status: { type: String, enum: ["open", "resolved", "closed"], default: "open" }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Confession", confessionSchema);
