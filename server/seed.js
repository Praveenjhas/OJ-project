// server/seed.js

import mongoose from "mongoose";
import dotenv from "dotenv";
import Problem from "./models/Problem.js";
import fs from "fs";
import path from "path";

dotenv.config();

const seedProblems = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Read and parse JSON file
    const filePath = path.resolve("fake_problems_seed.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // Remove previous problems (optional for clean slate)
    await Problem.deleteMany({});
    console.log("🗑️ Cleared existing problems");

    // Insert new problems
    await Problem.insertMany(data);
    console.log(`✅ Successfully seeded ${data.length} problems`);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
  } finally {
    // Close DB connection
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
};

seedProblems();
