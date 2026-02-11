const mongoose = require("mongoose");
const User = require("../server/models/User"); // Adjust path if needed
require("dotenv").config({ path: "../server/.env" }); // Load env from server dir

const CITY_TO_STATE = {
    "Mumbai": "Maharashtra",
    "Pune": "Maharashtra",
    "Nagpur": "Maharashtra",
    "Delhi": "Delhi",
    "New Delhi": "Delhi",
    "Bengaluru": "Karnataka",
    "Bangalore": "Karnataka",
    "Hyderabad": "Telangana",
    "Chennai": "Tamil Nadu",
    "Kolkata": "West Bengal",
    "Ahmedabad": "Gujarat",
    "Jaipur": "Rajasthan",
    "Lucknow": "Uttar Pradesh",
    "Chandigarh": "Chandigarh",
    "Indore": "Madhya Pradesh",
    "Bhopal": "Madhya Pradesh",
    "Patna": "Bihar",
    "Ranchi": "Jharkhand",
    "Raipur": "Chhattisgarh",
    "Shimla": "Himachal Pradesh",
    "Dehradun": "Uttarakhand",
    "Srinagar": "Jammu and Kashmir"
};

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to DB");

        const users = await User.find({ role: "lawyer" });
        console.log(`Found ${users.length} lawyers.`);

        let updatedCount = 0;
        for (const user of users) {
            const city = user.location?.city;
            if (city && !user.location.state) {
                const state = CITY_TO_STATE[city] || "India"; // Default if unknown
                user.location.state = state;
                await user.save();
                console.log(`Updated ${user.name}: ${city} -> ${state}`);
                updatedCount++;
            }
        }

        console.log(`✅ Migration Complete. Updated ${updatedCount} users.`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

migrate();
