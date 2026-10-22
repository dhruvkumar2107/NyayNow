const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: './.env' });

async function checkModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // The SDK doesn't have a direct listModels in the same way the REST API does easily without specific auth
        // But we can try the REST API directly with the key
        const fetch = require('node-fetch'); // Check if available
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;

        console.log("Fetching available models from REST API...");
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error("❌ API Error:", data.error.message);
            return;
        }

        console.log("✅ Models found:");
        data.models.forEach(m => {
            console.log(`- ${m.name} (Supports: ${m.supportedGenerationMethods.join(", ")})`);
        });
    } catch (err) {
        console.error("Check Failed:", err.message);
        console.log("Try fallback test for gemini-1.5-flash...");
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent("test");
            console.log("✅ gemini-1.5-flash is WORKING");
        } catch (e) {
            console.error("❌ gemini-1.5-flash FAILED:", e.message);
        }
    }
}

checkModels();
