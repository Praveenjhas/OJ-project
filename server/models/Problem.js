import mongoose from "mongoose";
const problemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    categories: {
      type: [String],
      default: [],
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    testCases: [
      {
        input: { type: String, required: true },
        expectedOutput: { type: String, required: true },
      },
    ],
    constraints: {
      type: [String],
      default: [],
    },
    sampleInputs: {
      type: [String],
      default: [],
    },
    sampleOutputs: {
      type: [String],
      default: [],
    },
    timeLimit: {
      type: Number,
      default: 1000 /*in millseconds*/,
      min: 1,
      max: 1000,
    },
    memoryLimit: {
      type: Number,
      default: 256,
      min: 1,
      max: 256,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    solvedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Problem", problemSchema);
