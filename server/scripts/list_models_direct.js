require('dotenv').config();
const axios = require('axios');

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY not found!");
        return;
    }
    console.log("✅ API Key found. Length:", apiKey.length);

    // Test both v1 and v1beta
    const versions = ['v1', 'v1beta'];

    for (const v of versions) {
        console.log(`\n🌐 Testing API version: ${v}`);
        const url = `https://generativelanguage.googleapis.com/${v}/models?key=${apiKey}`;
        try {
            const response = await axios.get(url);
            if (response.data.models) {
                console.log(`✅ Models found in ${v}:`);
                response.data.models.forEach(m => console.log(` - ${m.name}`));
            } else {
                console.log(`⚠️ No models list in ${v} response.`);
            }
        } catch (err) {
            console.error(`❌ Error with ${v}:`, err.response?.data?.error?.message || err.message);
        }
    }
}

listModels();
