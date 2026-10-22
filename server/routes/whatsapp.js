const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { generateWithFallback } = require("../utils/aiUtils");

// Twilio Helper to construct TwiML response
const sendTwiMLResponse = (res, messageText) => {
    res.set("Content-Type", "text/xml");
    res.send(`
        <Response>
            <Message>${messageText}</Message>
        </Response>
    `);
};

// Helper to clean Markdown for WhatsApp compatibility
function formatForWhatsApp(text) {
    // Convert **bold** to *bold* (WhatsApp bold format)
    let formatted = text.replace(/\*\*(.*?)\*\*/g, "*$1*");
    // Convert markdown headings to plain bold text
    formatted = formatted.replace(/^### (.*$)/gim, "*$1*");
    formatted = formatted.replace(/^## (.*$)/gim, "\n*$1*");
    formatted = formatted.replace(/^# (.*$)/gim, "\n*$1*\n");
    // Format bullet points
    formatted = formatted.replace(/^- (.*$)/gim, "• $1");
    
    // Add compliance footer
    formatted += "\n\n⚖️ *AI-generated legal information. Verify with a qualified lawyer.*";
    
    return formatted;
}

// POST /api/whatsapp/webhook - Twilio incoming WhatsApp Webhook
router.post("/webhook", async (req, res) => {
    try {
        const incomingMsg = req.body.Body;
        const fromRaw = req.body.From || ""; // e.g. "whatsapp:+919876543210"
        const fromPhone = fromRaw.replace("whatsapp:", "").trim();

        if (!incomingMsg) {
            return sendTwiMLResponse(res, "Sorry, I couldn't read your message.");
        }

        // 1. Authenticate user by phone number
        let user = await User.findOne({ 
            $or: [
                { phone: fromPhone },
                { phone: fromPhone.replace("+91", "") } // fallback for local format
            ]
        });

        if (!user) {
            return sendTwiMLResponse(
                res, 
                "Welcome to *NyayNow*! ⚖️\n\nYour WhatsApp number is not linked to any account. Please register at https://nyaynow.in and add this phone number to your profile to begin chatting with our Legal AI."
            );
        }

        // 2. Gate AI Usage Limits
        const isUnlimited = ["pro", "firm", "silver", "gold", "diamond"].includes(user.plan?.toLowerCase());
        let allowed = false;

        if (isUnlimited) {
            allowed = true;
        } else if (user.credits && user.credits > 0) {
            user.credits -= 1;
            allowed = true;
        } else if (user.aiUsage.count < 5) {
            if (user.aiUsage.count === 0 && !user.aiUsage.firstUsedAt) {
                user.aiUsage.firstUsedAt = new Date();
            }
            allowed = true;
        }

        if (!allowed) {
            return sendTwiMLResponse(
                res,
                "⚠️ *Limit Reached*\n\nYou have run out of query credits. Please purchase a credit pack (20 queries for ₹199) or upgrade to Pro on https://nyaynow.in/pricing to continue using the AI assistant via WhatsApp."
            );
        }

        // Increment count
        user.aiUsage.count += 1;
        await user.save();

        // 3. Construct Legal AI Prompt
        const prompt = `
          ACT AS THE NYAYNOW AI LEGAL ANALYSIS ENGINE.
          
          YOUR PERSONA:
          - You are a legal intelligence system programmed with Indian Law (BNS 2024).
          - Respond clearly, concisely, and factually since this is WhatsApp.
          - State relevant sections and laws.
          
          USER QUERY: "${incomingMsg}"
          
          DISCLAIMER: Always remind the user that this is legal information, not formal legal advice.
        `;

        // 4. Generate AI Answer
        const result = await generateWithFallback(prompt, undefined, true);
        const response = await result.response;
        const rawText = response.text();

        // 5. Format & Respond
        const whatsappText = formatForWhatsApp(rawText);
        sendTwiMLResponse(res, whatsappText);

    } catch (err) {
        console.error("WhatsApp Webhook Error:", err);
        sendTwiMLResponse(res, "An error occurred while processing your legal query. Please try again later.");
    }
});

module.exports = router;
