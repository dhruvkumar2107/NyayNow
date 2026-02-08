const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

const logFile = path.join(process.cwd(), 'debug_key.txt');
function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
}
fs.writeFileSync(logFile, '');

async function testKey() {
    log("📂 CWD: " + process.cwd());
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        log("❌ No API Key found in .env");
        return;
    }

    log("🔑 Testing API Key (Length: " + apiKey.length + ")...");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const result = await model.generateContent("Hello, are you working?");
        log("✅ API Key is WORKING! Response: " + result.response.text());
    } catch (error) {
        log("❌ API Key FAILED: " + error.message);
    }
}

testKey();
