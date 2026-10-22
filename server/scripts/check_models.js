const fs = require('fs');
const path = require('path');

const logFile = path.join(process.cwd(), 'debug_models.txt');
function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
}

// Clear previous log
fs.writeFileSync(logFile, '');

const dotenv = require('dotenv');
dotenv.config();

async function listModels() {
    log("📂 CWD: " + process.cwd());

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        log("❌ GEMINI_API_KEY not found in environment!");
        return;
    }
    log("✅ API Key found (Length: " + apiKey.length + ")");

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        log("🌐 Fetching models from Google API...");
        // Dynamic import for node-fetch if needed, or use global fetch if Node 18+
        // Assuming Node 18+
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            log("❌ API Error: " + JSON.stringify(data.error, null, 2));
        } else if (data.models) {
            log("\n✅ AVAILABLE MODELS:");
            data.models.forEach(m => {
                const name = m.name.replace('models/', '');
                log(`- [${name}]`);
            });
        } else {
            log("⚠️ No models returned. Raw response: " + JSON.stringify(data, null, 2));
        }
    } catch (error) {
        log("❌ Network/Fetch Error: " + error.message);
    }
}

listModels();
