// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50, // Increased max length to allow full names
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true, // Make sure to hash before saving
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    solvedProblems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
      },
    ],
    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
