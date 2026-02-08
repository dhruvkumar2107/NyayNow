const mongoose = require("mongoose");
const Topic = require("../models/Topic");
require("dotenv").config({ path: "../.env" });

const topics = [
    { name: "#BharatiyaNyayaSanhita", count: 24000 },
    { name: "#ConsumerRightsDay", count: 12500 },
    { name: "#DigitalHygiene", count: 8200 },
    { name: "#LegalTech", count: 5000 },
    { name: "#SupremeCourt", count: 15600 }
];

const seedTopics = async () => {
    try {
        if (!process.env.MONGO_URI) {
            process.env.MONGO_URI = "mongodb://localhost:27017/nyaynow";
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected...");

        await Topic.deleteMany({});
        await Topic.insertMany(topics);
        console.log("Topics seeded!");

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedTopics();
