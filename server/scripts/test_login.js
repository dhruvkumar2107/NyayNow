const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const testLogin = async () => {
    try {
        // 1. Setup Env & Connection (Same as seed)
        require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

        let uri = process.env.MONGO_URI;
        if (!uri && !uri?.startsWith("mongodb")) {
            uri = "mongodb://localhost:27017/nyaysathi";
        }
        if (uri.includes("//mongo:") || uri.includes("@mongo:")) {
            uri = uri.replace("mongo:", "127.0.0.1:");
        }

        console.log("Connecting to:", uri);
        await mongoose.connect(uri);

        // 2. Fetch Admin
        const email = "admin@nyaysathi.com";
        const admin = await User.findOne({ email });

        if (!admin) {
            console.error("❌ Admin user NOT FOUND in this database.");
            process.exit(1);
        }

        console.log("✅ Admin Found:", admin._id);
        console.log("   Stored Hash:", admin.password);

        // 3. Compare
        const password = "admin123";
        const isMatch = await bcrypt.compare(password, admin.password);

        console.log(`Testing password '${password}':`);
        console.log(isMatch ? "✅ PASSWORD MATCHES!" : "❌ PASSWORD INVALID");

        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

testLogin();
