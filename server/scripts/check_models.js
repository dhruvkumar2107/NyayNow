const fs = require('fs');
const path = require('path');

const logFile = path.join(process.cwd(), 'debug_models.txt');
function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
}

// Clear previous log
fs.writeFileSync(logFile, '');

async function listModels() {
    log("📂 CWD: " + process.cwd());

    const envPath = path.join(process.cwd(), '.env');
    log("🔎 Looking for .env at: " + envPath);

    if (!fs.existsSync(envPath)) {
        log("❌ .env file NOT FOUND!");
        return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);

    if (!match || !match[1]) {
        log("❌ GEMINI_API_KEY not found in .env file content!");
        return;
    }

    const apiKey = match[1].trim();
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
