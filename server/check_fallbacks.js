const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: './.env' });

async function verifyFallbacks() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const models = ["gemini-1.5-flash", "gemini-2.0-flash"];

    for (const m of models) {
        try {
            console.log(`🚀 Testing ${m}...`);
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("test");
            const response = await result.response;
            console.log(`✅ ${m} is WORKING!`);
        } catch (err) {
            console.error(`❌ ${m} FAILED:`, err.message);
        }
    }
}

verifyFallbacks();
