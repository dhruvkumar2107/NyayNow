const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config({ path: "../.env" });

const lawyers = [
  {
    name: "Adv. Rajesh Kumar",
    email: "rajesh.kumar@law.com",
    password: "password123", // In a real app, hash this
    role: "lawyer",
    plan: "diamond",
    specialization: "Criminal Law",
    experience: 15,
    location: {
      city: "Bengaluru",
      lat: 12.9716, // Near High Court
      lng: 77.5946
    },
    verified: true
  },
  {
    name: "Adv. Priya Menon",
    email: "priya.menon@law.com",
    password: "password123",
    role: "lawyer",
    plan: "gold",
    specialization: "Family Law",
    experience: 8,
    location: {
      city: "Bengaluru",
      lat: 12.9352, // Koramangala
      lng: 77.6245
    },
    verified: true
  },
  {
    name: "Adv. Suresh Reddy",
    email: "suresh.reddy@law.com",
    password: "password123",
    role: "lawyer",
    plan: "silver",
    specialization: "Civil Litigation",
    experience: 5,
    location: {
      city: "Bengaluru",
      lat: 12.9141, // Jayanagar
      lng: 77.5862
    },
    verified: true
  }
];

const seedLawyers = async () => {
  try {
    if (!process.env.MONGO_URI) {
      // Fallback for local testing if env not loaded
      process.env.MONGO_URI = "mongodb://localhost:27017/nyaysathi";
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // Remove existing seed lawyers to avoid dupes
    await User.deleteMany({ email: { $in: lawyers.map(l => l.email) } });

    await User.insertMany(lawyers);
    console.log("Lawyers seeded successfully!");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedLawyers();
