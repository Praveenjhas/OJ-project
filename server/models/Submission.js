import mongoose from "mongoose";
const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true,
  },
  code: { type: String, required: true },
  language: { type: String, required: true },
  verdict: {
    type: String,
    enum: [
      "Pending",
      "Accepted",
      "Wrong Answer",
      "Time Limit Exceeded",
      "Runtime Error",
      "Compilation Error",
      "Memory Limit Exceeded",
      "Error",
    ],
    default: "Pending",
  },
  executionTime: { type: Number },
  memoryUsed: { type: Number },
  errorMessage: { type: String },
  testCaseResults: [
    {
      input: String,
      expectedOutput: String,
      userOutput: String,
      passed: Boolean,
    },
  ],
  submittedAt: { type: Date, default: Date.now },
});
export default mongoose.model("Submission", submissionSchema);
