const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
require("dotenv").config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;

async function listModels() {
    const logFile = path.join(__dirname, 'available_models.txt');
    fs.writeFileSync(logFile, `Checking models for key ending in ...${apiKey ? apiKey.slice(-4) : 'NONE'}\n`);

    if (!apiKey) {
        console.error("No API Key found");
        return;
    }

    try {
        // We will use raw fetch because the SDK methods for listing models can be tricky across versions
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            fs.appendFileSync(logFile, `API ERROR: ${JSON.stringify(data.error, null, 2)}\n`);
        } else if (data.models) {
            fs.appendFileSync(logFile, "AVAILABLE MODELS:\n");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    fs.appendFileSync(logFile, `[SUPPORTED] ${m.name}\n`);
                } else {
                    fs.appendFileSync(logFile, `[Unsupported Method] ${m.name}\n`);
                }
            });
        } else {
            fs.appendFileSync(logFile, `UNKNOWN RESPONSE: ${JSON.stringify(data, null, 2)}\n`);
        }

    } catch (error) {
        fs.appendFileSync(logFile, `SCRIPT CRASH: ${error.message}\n`);
    }
}

listModels();
