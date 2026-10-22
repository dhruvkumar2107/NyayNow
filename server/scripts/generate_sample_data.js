/**
 * server/scripts/generate_sample_data.js
 *
 * Run this from inside the server folder:
 *   cd server
 *   node ./scripts/generate_sample_data.js
 *
 * This script:
 *  - connects to MongoDB using server/.env (MONGO_URI)
 *  - generates sample users (clients + lawyers)
 *  - generates sample cases
 *  - generates sample messages
 *  - inserts data into MongoDB
 *  - writes JSON files to project root
 */

const path = require("path");
const fs = require("fs");

require("dotenv").config({
  path: path.resolve(__dirname, "..", ".env"),
});

const mongoose = require("mongoose");

// Import models
const User = require("../models/User");
const Case = require("../models/Case");
const Message = require("../models/Message");

// Mongo URI
const MONGO = process.env.MONGO_URI || "mongodb://localhost:27017/nyaysathi";

// Helpers
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (n) => Math.floor(Math.random() * n);

async function main() {
  console.log("Connecting to Mongo:", MONGO);
  await mongoose.connect(MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to Mongo");

  // ---------------------------
  // Generate Sample Clients
  // ---------------------------
  const sampleClients = [];
  for (let i = 1; i <= 6; i++) {
    sampleClients.push({
      role: "client",
      name: `Client ${i}`,
      phone: `90000000${(10 + i).toString().padStart(2, "0")}`,
      passwordHash: null,
      headline: `Client headline ${i}`,
      bio: `This is a sample bio for client ${i}.`,
      location: ["Mumbai", "Delhi", "Bengaluru", "Chennai", "Kolkata", "Pune"][i % 6],
      createdAt: new Date(),
    });
  }

  // ---------------------------
  // Generate Sample Lawyers
  // ---------------------------
  const practiceFields = ["Criminal", "Family", "Property", "Corporate", "Civil", "Consumer"];
  const sampleLawyers = [];

  for (let i = 1; i <= 6; i++) {
    sampleLawyers.push({
      role: "lawyer",
      name: `Lawyer ${i}`,
      phone: `80000000${(10 + i).toString().padStart(2, "0")}`,
      passwordHash: null,
      headline: `${practiceFields[i % practiceFields.length]} Lawyer`,
      bio: `Experienced ${practiceFields[i % practiceFields.length]} lawyer.`,
      location: ["Mumbai", "Delhi", "Bengaluru", "Chennai", "Kolkata", "Pune"][i % 6],
      experience: 3 + i,
      fields: [practiceFields[i % practiceFields.length]],
      createdAt: new Date(),
    });
  }

  // ---------------------------
  // Generate Sample Cases
  // ---------------------------
  const sampleCases = [];
  for (let i = 1; i <= 8; i++) {
    sampleCases.push({
      title: `Sample Case ${i}`,
      desc: `This is a sample description for case ${i}.`,
      field: rand(practiceFields),
      location: rand(["Mumbai", "Delhi", "Bengaluru", "Chennai"]),
      budget: ["Free", "Fixed", "Negotiable"][i % 3],
      postedBy: sampleClients[(i - 1) % sampleClients.length].phone,
      postedAt: new Date(Date.now() - i * 86400000),
      acceptedBy: null,
    });
  }

  // ---------------------------
  // Generate Sample Messages
  // ---------------------------
  const sampleMessages = [];
  for (let i = 1; i <= 10; i++) {
    sampleMessages.push({
      sender: rand(sampleClients).phone,
      recipient: rand(sampleLawyers).phone,
      text: `Hello, this is a sample message ${i}.`,
      ts: new Date(Date.now() - randInt(48) * 3600000),
    });
  }

  // ---------------------------
  // Insert Clients + Lawyers
  // ---------------------------
  console.log("Upserting clients...");
  for (const c of sampleClients) {
    await User.updateOne({ phone: c.phone }, { $set: c }, { upsert: true });
  }

  console.log("Upserting lawyers...");
  for (const l of sampleLawyers) {
    await User.updateOne({ phone: l.phone }, { $set: l }, { upsert: true });
  }

  // ---------------------------
  // Insert Cases
  // ---------------------------
  console.log("Inserting cases...");
  for (const c of sampleCases) {
    await Case.updateOne(
      { title: c.title, postedBy: c.postedBy },
      { $set: c },
      { upsert: true }
    );
  }

  // ---------------------------
  // Insert Messages
  // ---------------------------
  console.log("Inserting messages...");
  for (const m of sampleMessages) {
    await Message.create(m);
  }

  // ---------------------------
  // Write JSON files to project root
  // ---------------------------
  console.log("Writing JSON files to project root...");

  const root = path.resolve(__dirname, "..", "..");

  fs.writeFileSync(path.join(root, "clients.json"), JSON.stringify(sampleClients, null, 2));
  fs.writeFileSync(path.join(root, "lawyers.json"), JSON.stringify(sampleLawyers, null, 2));
  fs.writeFileSync(path.join(root, "cases.json"), JSON.stringify(sampleCases, null, 2));
  fs.writeFileSync(path.join(root, "messages.json"), JSON.stringify(sampleMessages, null, 2));

  console.log("Sample data inserted successfully.");
  await mongoose.disconnect();
  console.log("Disconnected. Done.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
