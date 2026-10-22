const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config();

const seedAdmin = async () => {
    try {
        require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") }); // Correct path to server/.env

        console.log("🚀 Starting Seed Script...");
        if (!process.env.MONGO_URI && !process.env.MONGO_URI?.startsWith("mongodb")) {
            process.env.MONGO_URI = "mongodb://localhost:27017/nyaynow";
            console.log("⚠️ Fallback to localhost");
        }
        let uri = process.env.MONGO_URI;
        // Fix protocol breakage: specifically replace 'mongo' hostname only
        if (uri.includes("//mongo:") || uri.includes("@mongo:")) {
            console.log("⚠️ Detected Docker hostname 'mongo', switching to '127.0.0.1'...");
            uri = uri.replace("mongo:", "127.0.0.1:");
        }

        console.log("Connecting to:", uri); // Log full URI for debugging (masked if password exists)

        await mongoose.connect(uri);
        console.log("Connected to MongoDB");

        const email = "admin@nyaynow.com";
        const password = "admin123";
        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await User.findOneAndUpdate(
            { email },
            {
                name: "Super Admin",
                email,
                password: hashedPassword,
                role: "admin",
                plan: "diamond",
                verified: true,
            },
            { upsert: true, new: true }
        );

        console.log("✅ Admin User Created/Updated:");
        console.log("   Email: " + admin.email);
        console.log("   Password: " + password);

        // Write success file
        require("fs").writeFileSync("server/seed_success.txt", `Admin Created: ${new Date().toISOString()}`);
        process.exit();
    } catch (err) {
        console.error(err);
        // Write error file with URI
        const uriLog = process.env.MONGO_URI ? `[${process.env.MONGO_URI}]` : "UNDEFINED";
        require("fs").writeFileSync("server/seed_error.txt", `URI: ${uriLog}\nError: ${err.message}`);
        process.exit(1);
    }
};

seedAdmin();
