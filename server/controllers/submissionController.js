// server/controllers/submissionController.js

import mongoose from "mongoose";
import Submission from "../models/Submission.js";
import Problem from "../models/Problem.js";
import { runUserCode } from "../utils/codeExecutor.js";

// map user input to our three supported langs
function normalizeLanguage(lang) {
  if (!lang) return "";
  const map = {
    "c++": "cpp",
    cpp: "cpp",
    java: "java",
    python: "python",
    python3: "python",
  };
  return map[lang.trim().toLowerCase()] || lang.trim().toLowerCase();
}

// simple line-by-line compare
function normalizeAndCompare(uOut, eOut) {
  const norm = (str) =>
    str
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

  const u = norm(uOut),
    e = norm(eOut);
  if (u.length !== e.length) return false;
  return u.every((line, i) => line === e[i]);
}

export const submitSolution = async (req, res) => {
  try {
    const { problem: problemId, user, code, language } = req.body;
    if (!user || !problemId || !code || !language) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const lang = normalizeLanguage(language);
    if (!["cpp", "java", "python"].includes(lang)) {
      return res
        .status(400)
        .json({ error: `Unsupported language: ${language}` });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const results = [];
    let verdict = "Accepted";

    for (const tc of problem.testCases) {
      const r = await runUserCode({
        code,
        language: lang,
        input: tc.input,
        timeLimitMs: problem.timeLimit,
      });

      // extract resource stats
      const secs = r.resourceStats?.userTimeSec ?? 0; // seconds
      const kb = r.resourceStats?.maxMemoryKB ?? 0; // KB

      // decide pass/fail
      let passed = false;
      if (r.verdict === "Accepted") {
        passed = normalizeAndCompare(r.output, tc.expectedOutput);
        if (!passed) verdict = "Wrong Answer";
      } else {
        verdict = r.verdict;
      }

      results.push({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        userOutput: r.output || "",
        passed,
        error: r.error || null,
        verdict: r.verdict,
        // store per-test resource usage too if you like:
        executionTime: secs * 1000, // ms
        memoryUsed: kb / 1024, // MB
      });

      if (verdict !== "Accepted") break;
    }

    // take last stats for the overall submission
    const last = results[results.length - 1] || {};
    const executionTime = last.executionTime ?? null;
    const memoryUsed = last.memoryUsed ?? null;

    const submission = await Submission.create({
      problem: problemId,
      user,
      code,
      language: lang,
      verdict,
      executionTime, // now in ms
      memoryUsed, // now in MB
      testCaseResults: results,
    });

    return res.status(201).json({
      submissionId: submission._id,
      verdict,
      executionTime,
      memoryUsed,
      testCaseResults: results,
      submittedAt: submission.submittedAt,
    });
  } catch (err) {
    console.error("🚨 submitSolution error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSubmissionsByProblem = async (req, res) => {
  try {
    const userId = req.user;
    const { problemId } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!problemId || !mongoose.Types.ObjectId.isValid(problemId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing problemId" });
    }

    const subs = await Submission.find({
      problem: problemId,
      user: userId,
    })
      .sort({ submittedAt: -1 })
      .select(
        "_id verdict executionTime memoryUsed submittedAt language code testCaseResults"
      )
      .lean();

    return res.status(200).json({ success: true, submissions: subs });
  } catch (err) {
    console.error("🔥 getSubmissionsByProblem error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
