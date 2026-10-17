const axios = require('axios');

async function testAI() {
    try {
        console.log("Testing AI Assistant...");
        const res = await axios.post('http://localhost:4000/api/ai/assistant', {
            question: "What is 2+2?",
            language: "English"
        });
        console.log("AI Response:", JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error("AI Assistant Failed:", err.message);
        if (err.response) console.error(err.response.data);
    }

    try {
        console.log("\nTesting Agreement Analysis...");
        const res = await axios.post('http://localhost:4000/api/ai/analyze', {
            text: "This contract is valid for 100 years and cannot be cancelled."
        });
        console.log("Analysis Response:", JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error("Analysis Failed:", err.message);
        if (err.response) console.error(err.response.data);
    }
}

testAI();
