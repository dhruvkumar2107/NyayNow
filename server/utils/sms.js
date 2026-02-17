const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SID; // Optional if using Verify API

let client;

if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
} else {
    console.warn("⚠️ TWILIO KEYS MISSING: SMS/WhatsApp will be logged to console only.");
}

/**
 * Send an SMS via Twilio
 * @param {string} to - Phone number with country code (e.g., +919999999999)
 * @param {string} body - Message content
 */
const sendSMS = async (to, body) => {
    try {
        if (!client) {
            console.log(`[MOCK SMS] To: ${to} | Msg: ${body}`);
            return { sid: 'mock-sid', status: 'sent' };
        }

        const message = await client.messages.create({
            body: body,
            from: process.env.TWILIO_PHONE_NUMBER, // Start this in .env
            to: to
        });

        console.log(`[Twilio] SMS sent to ${to}: ${message.sid}`);
        return message;
    } catch (error) {
        console.error("[Twilio Error] Failed to send SMS:", error.message);
        // Don't crash the app, just log
        return null;
    }
};

/**
 * Send a WhatsApp Message via Twilio
 * @param {string} to - Phone number
 * @param {string} body - Message content
 */
const sendWhatsApp = async (to, body) => {
    try {
        // Twilio requires 'whatsapp:' prefix
        const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
        const formattedFrom = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER}`;

        if (!client) {
            console.log(`[MOCK WHATSAPP] To: ${formattedTo} | Msg: ${body}`);
            return { sid: 'mock-wa-sid', status: 'sent' };
        }

        const message = await client.messages.create({
            body: body,
            from: formattedFrom,
            to: formattedTo
        });

        console.log(`[Twilio] WhatsApp sent to ${to}: ${message.sid}`);
        return message;
    } catch (error) {
        console.error("[Twilio Error] Failed to send WhatsApp:", error.message);
        return null;
    }
};

module.exports = { sendSMS, sendWhatsApp };
