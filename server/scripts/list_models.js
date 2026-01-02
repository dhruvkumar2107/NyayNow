const axios = require('axios');
const path = require('path');
require("dotenv").config({ path: path.join(__dirname, '../.env') });

async function listModels() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        console.log("Key Loaded:", !!apiKey);

        if (!apiKey) {
            console.error("API Key missing!");
            return;
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

        console.log("Fetching models...");
        const response = await axios.get(url);
        const data = response.data;

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log("No models found:", data);
        }

    } catch (err) {
        console.error("Error listing models:");
        if (err.response) {
            console.error(err.response.status, err.response.data);
        } else {
            console.error(err.message);
        }
    }
}

listModels();
