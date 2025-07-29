// server/config/db.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
export const connectDB = () =>
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error(err));
