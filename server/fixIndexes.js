require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/nyaysathi";

async function run() {
  try {
    console.log("Connecting to database:", MONGO_URI.split("@")[1] || MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    const db = mongoose.connection.db;
    const collection = db.collection("otpentries");

    console.log("Fetching current indexes on 'otpentries'...");
    const indexes = await collection.indexes();
    console.log("Current indexes:", indexes);

    // Drop all indexes except _id_
    console.log("Dropping indexes on 'otpentries' collection...");
    await collection.dropIndexes().catch(err => {
      console.log("No indexes to drop or collection doesn't exist yet:", err.message);
    });

    console.log("Indexes dropped successfully.");
    console.log("Mongoose will recreate the correct indexes on the next startup.");
  } catch (err) {
    console.error("Error fixing indexes:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
}

run();
