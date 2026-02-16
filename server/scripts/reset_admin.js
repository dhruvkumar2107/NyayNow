const path = require('path');
const fs = require('fs');
const envPath = path.resolve(__dirname, '../.env');
console.log("Loading .env from:", envPath);

if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
} else {
    console.error("❌ .env file NOT found at:", envPath);
}

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const resetAdmin = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/nyaysathi";
        console.log("Connecting to MongoDB at:", mongoUri);
        fs.writeFileSync("admin_debug.log", `Attempting connection to ${mongoUri}\n`);

        await mongoose.connect(mongoUri);
        console.log("✅ Connected to MongoDB");

        const email = "admin@nyaynow.com";
        const password = "admin123";
        const hashedPassword = await bcrypt.hash(password, 10);

        let admin = await User.findOne({ email });

        if (admin) {
            admin.password = hashedPassword;
            admin.role = "admin"; // Ensure role is admin
            admin.verified = true; // Ensure verified
            await admin.save();
            console.log("✅ Admin password reset successfully.");
        } else {
            admin = await User.create({
                name: "Super Admin",
                email,
                password: hashedPassword,
                role: "admin",
                verified: true,
                plan: "premium"
            });
            console.log("✅ Admin account created successfully.");
        }

        console.log(`\n👉 Login with:\nEmail: ${email}\nPassword: ${password}\n`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Error resetting admin:", error);
        // process.exit(1);
    }
};

console.log("Starting admin reset script...");
console.log("Looking for .env at:", require('path').resolve(__dirname, '../.env'));
resetAdmin();
