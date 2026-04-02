const axios = require('axios');

async function testApi() {
  try {
    const res = await axios.post('https://nyaysathi-main.onrender.com/api/ai/draft-notice', {
      notice_details: "Tenant owes me 50,000 rupees rent",
      language: "English",
      type: "Legal Notice for Eviction"
    });
    console.log("SUCCESS:", res.data.draft ? res.data.draft.substring(0, 50) + '...' : res.data);
  } catch (err) {
    console.log("ERROR STATUS:", err.response?.status);
    console.log("ERROR DATA:", err.response?.data);
    console.log("ERROR MSG:", err.message);
  }
}

testApi();
