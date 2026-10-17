const axios = require('axios');

async function checkNearby() {
    try {
        console.log("Testing /api/nearby with Bengaluru coordinates...");
        const res = await axios.get('http://localhost:4000/api/nearby?lat=12.97&lon=77.59');

        console.log("Status:", res.status);
        console.log("Data Length:", res.data.length);

        const hasRealLawyer = res.data.some(item => item.name === "Adv. Rajesh Kumar" || item.is_real === true);

        if (hasRealLawyer) {
            console.log("SUCCESS: Found seeded lawyer 'Adv. Rajesh Kumar' in response!");
            console.log(JSON.stringify(res.data.find(i => i.is_real), null, 2));
        } else {
            console.error("FAILURE: Seeded lawyers not found in response.");
            console.log("First 3 items:", JSON.stringify(res.data.slice(0, 3), null, 2));
        }

    } catch (err) {
        console.error("Request Failed:", err.message);
        if (err.response) console.error("Response:", err.response.data);
    }
}

checkNearby();
