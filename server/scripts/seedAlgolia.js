require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Case = require("../models/Case");
const { syncLawyer, syncLead } = require("../utils/algolia");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/nyaynow";

async function seedAlgolia() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ DB Connected");

        // 1. Sync Lawyers
        const lawyers = await User.find({ role: "lawyer" });
        console.log(`Found ${lawyers.length} lawyers. Syncing...`);
        for (const lawyer of lawyers) {
            await syncLawyer(lawyer);
        }

        // 2. Sync Leads
        const leads = await Case.find({});
        console.log(`Found ${leads.length} leads. Syncing...`);
        for (const lead of leads) {
            await syncLead(lead);
        }

        console.log("✅ Algolia Seed Complete!");
        process.exit(0);

    } catch (err) {
        console.error("❌ Seed Error:", err);
        process.exit(1);
    }
}

seedAlgolia();
