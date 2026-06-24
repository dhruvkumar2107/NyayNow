const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config({ path: "../.env" });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/nyaysathi";

const fs = require('fs');

async function check() {
    try {
        await mongoose.connect(MONGO_URI);
        const count = await User.countDocuments({ role: "lawyer" });
        const msg = `Connected. Lawyer Count: ${count}`;
        fs.writeFileSync('db_status.txt', msg);
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('db_status.txt', `Error: ${err.message}`);
        process.exit(1);
    }
}

check();
