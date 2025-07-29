// server/controllers/problemController.js

import mongoose from "mongoose";
import Problem from "../models/Problem.js";
import Submission from "../models/Submission.js";

// GET /api/problems?userId=xyz&difficulty=Easy&category=DP
export const getAllProblems = async (req, res) => {
  try {
    const { userId, difficulty, category } = req.query;
    const filter = {};

    if (difficulty && difficulty !== "All") {
      filter.difficulty = difficulty;
    }
    if (category && category !== "All") {
      // now a guaranteed “array contains”
      filter.categories = { $in: [category] };
    }

    const problems = await Problem.find(filter).select(
      "_id title difficulty categories solvedCount"
    );

    const solvedMap = {};
    if (userId) {
      const accepted = await Submission.find({
        user: userId,
        verdict: "Accepted",
      }).select("problem");
      accepted.forEach((sub) => {
        solvedMap[sub.problem.toString()] = true;
      });
    }

    const response = problems.map((p) => ({
      _id: p._id,
      title: p.title,
      difficulty: p.difficulty,
      categories: p.categories,
      solvedCount: p.solvedCount,
      solvedByUser: !!solvedMap[p._id.toString()],
    }));

    return res.json({ success: true, problems: response });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/problems/:id
export const getProblemById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid problem ID" });
    }

    // Fetch full problem document
    const problem = await Problem.findById(id).populate(
      "createdBy",
      "username"
    );

    if (!problem) {
      return res
        .status(404)
        .json({ success: false, message: "Problem not found" });
    }

    return res.status(200).json({ success: true, problem });
  } catch (err) {
    console.error("Error in getProblemById:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
