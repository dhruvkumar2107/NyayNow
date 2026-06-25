const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: './.env' });

async function debugGemini() {
    try {
        console.log("SDK Package info...");
        try {
            const pkg = require('./node_modules/@google/generative-ai/package.json');
            console.log("SDK Version:", pkg.version);
        } catch (e) {
            console.log("Could not find package.json for SDK");
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        console.log("API Key present:", !!process.env.GEMINI_API_KEY);

        // Try gemini-pro (v1)
        console.log("Attempting gemini-pro...");
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        try {
            const result = await model.generateContent("Hi");
            console.log("gemini-pro OK");
        } catch (e) {
            console.log("gemini-pro FAILED:", e.message);
        }

        // Try models/gemini-1.5-flash
        console.log("Attempting models/gemini-1.5-flash...");
        const flashModel = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
        try {
            const result = await flashModel.generateContent("Hi");
            console.log("models/gemini-1.5-flash OK");
        } catch (e) {
            console.log("models/gemini-1.5-flash FAILED:", e.message);
        }

    } catch (err) {
        console.error("Debug Failed:", err);
    }
}

debugGemini();
