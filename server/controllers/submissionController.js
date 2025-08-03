import Submission from "../models/Submission.js";
import Problem from "../models/Problem.js";
import { runUserCode } from "../utils/codeExecutor.js";
import mongoose from "mongoose";
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

function normalizeAndCompare(uOut, eOut) {
  const norm = (str) =>
    str
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

  const uLines = norm(uOut);
  const eLines = norm(eOut);

  if (uLines.length !== eLines.length) return false;
  return uLines.every((line, i) => line === eLines[i]);
}

export const submitSolution = async (req, res) => {
  try {
    const { problem: problemId, user, code, language } = req.body;
    if (!user || !problemId || !code || !language)
      return res.status(400).json({ error: "Missing required fields" });

    const normalizedLanguage = normalizeLanguage(language);
    if (!["cpp", "java", "python"].includes(normalizedLanguage)) {
      return res
        .status(400)
        .json({ error: `Unsupported language: ${language}` });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const testCases = problem.testCases || [];
    const results = [];
    let finalVerdict = "Accepted";

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const result = await runUserCode({
        code,
        language: normalizedLanguage,
        input: tc.input,
        timeLimitMs: problem.timeLimit,
      });

      let passed = false;
      if (result.verdict === "Accepted") {
        passed = normalizeAndCompare(result.output, tc.expectedOutput);
        if (!passed) finalVerdict = "Wrong Answer";
      } else {
        finalVerdict = result.verdict;
      }

      results.push({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        userOutput: result.output || "",
        passed,
        error: result.error || null,
        verdict: result.verdict,
        resourceStats: result.resourceStats || null,
      });

      if (finalVerdict !== "Accepted") break;
    }

    const lastResult = results[results.length - 1] || {};

    const executionTime =
      lastResult.resourceStats &&
      lastResult.resourceStats.userTimeSec != null &&
      lastResult.resourceStats.sysTimeSec != null
        ? (lastResult.resourceStats.userTimeSec +
            lastResult.resourceStats.sysTimeSec) *
          1000
        : null;
    const memoryUsed =
      lastResult.resourceStats && lastResult.resourceStats.maxMemoryKB
        ? lastResult.resourceStats.maxMemoryKB / 1024
        : null;

    const submission = await Submission.create({
      problem: problemId,
      user,
      code,
      language: normalizedLanguage,
      verdict: finalVerdict,
      executionTime,
      memoryUsed,
      errorMessage: lastResult.error || null,
      testCaseResults: results,
    });

    return res.status(201).json({
      submissionId: submission._id,
      verdict: finalVerdict,
      testCasesPassed: results.filter((r) => r.passed).length,
      totalTestCases: results.length,
      executionTime,
      memoryUsed,
      errorMessage: submission.errorMessage,
      testCaseResults: results,
      submittedAt: submission.createdAt,
    });
  } catch (err) {
    console.error("Submission error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getSubmissionsByProblem = async (req, res) => {
  try {
    const userId = req.user; // from your auth middleware
    const { problemId } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!problemId) {
      return res
        .status(400)
        .json({ success: false, message: "problemId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid problem ID" });
    }

    const subs = await Submission.find({
      problem: problemId,
      user: userId,
    })
      .sort({ submittedAt: -1 })
      .select("_id verdict executionTime memoryUsed submittedAt language code")
      .lean();

    return res.status(200).json({ success: true, submissions: subs });
  } catch (err) {
    console.error("🔥 [getSubmissionsByProblem] Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
