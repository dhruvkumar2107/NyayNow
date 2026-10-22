const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: './.env' });

async function verify25Pro() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Try the exact string from the list
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

        console.log("🚀 Testing Gemini 2.5 Pro...");
        const result = await model.generateContent("Explain the concept of 'Res Judicata' in Indian law in two sentences.");
        const response = await result.response;
        console.log("✅ SUCCESS!");
        console.log("Response:", response.text());
    } catch (err) {
        console.error("❌ Gemini 2.5 Pro Verification FAILED:", err.message);
        console.log("Trying with 'models/gemini-2.5-pro' prefix...");
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-pro" });
            const result = await model.generateContent("test");
            console.log("✅ models/gemini-2.5-pro is WORKING");
        } catch (e) {
            console.error("❌ models/gemini-2.5-pro FAILED:", e.message);
        }
    }
}

verify25Pro();
