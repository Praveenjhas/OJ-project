//server/config/db.js
import mongoose from "mongoose";
import dotenv from "dotenv";
export const connectDB = async () => {
  try {
    mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("Database Not Connected", err);
    process.exit(1);
  }
};
