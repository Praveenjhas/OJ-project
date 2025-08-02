import Submission from "../models/Submission.js";
import mongoose from "mongoose";
import Problem from "../models/Problem.js";
import { runUserCode } from "../utils/codeExecutor.js";

// Normalize language input
function normalizeLanguage(lang) {
  if (!lang) return "";
  const mapping = {
    "c++": "cpp",
    cpp: "cpp",
    java: "java",
    python: "python",
    python3: "python",
  };
  return mapping[lang.trim().toLowerCase()] || lang.trim().toLowerCase();
}

// Compare outputs
function normalizeAndCompare(uOut, eOut) {
  const normalize = (str) =>
    str
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

  const uLines = normalize(uOut);
  const eLines = normalize(eOut);

  if (uLines.length !== eLines.length) {
    console.log(
      `[normalizeAndCompare] Line count mismatch: user=${uLines.length}, expected=${eLines.length}`
    );
    return false;
  }

  const matched = uLines.every((l, i) => l === eLines[i]);
  if (!matched) {
    console.log("[normalizeAndCompare] Output lines differ:");
    uLines.forEach((line, idx) => {
      if (line !== eLines[idx]) {
        console.log(
          ` Line ${idx + 1}: user="${line}" expected="${eLines[idx]}"`
        );
      }
    });
  }
  return matched;
}

// Submit handler
export const submitSolution = async (req, res) => {
  try {
    const { problem: problemId, user, code, language } = req.body;

    if (!user || !problemId || !code || !language) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const normalizedLanguage = normalizeLanguage(language);

    if (!["cpp", "java", "python"].includes(normalizedLanguage)) {
      return res
        .status(400)
        .json({ error: `Unsupported language: ${language}` });
    }

    console.log(
      `📥 [submitSolution] User=${user}, Lang=${normalizedLanguage}, Problem=${problemId}`
    );

    const problem = await Problem.findById(problemId);
    if (!problem) {
      console.log(`❌ [submitSolution] Problem not found`);
      return res.status(404).json({ error: "Problem not found" });
    }

    const results = [];
    let allPassed = true;

    for (const tc of problem.testCases) {
      console.log(`🧪 Running test case:`, JSON.stringify(tc.input));
      let userOutput = "",
        passed = false,
        error = null;

      try {
        const result = await runUserCode({
          code,
          language: normalizedLanguage,
          input: tc.input,
          timeLimitMs: problem.timeLimit,
        });

        if (result.error) {
          error = result.error;
          console.log(`❌ Execution error:\n${error}`);
        } else {
          userOutput = result.output;
          console.log(`--- User Output ---\n${JSON.stringify(userOutput)}`);
          console.log(
            `--- Expected Output ---\n${JSON.stringify(tc.expectedOutput)}`
          );
          passed = normalizeAndCompare(userOutput, tc.expectedOutput);
          console.log(`✅ Passed: ${passed}`);
        }
      } catch (err) {
        error = err.message;
        console.log(`🔥 Exception: ${error}`);
      }

      if (!passed) allPassed = false;
      results.push({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        userOutput,
        passed,
        error,
      });
    }

    const verdict = allPassed ? "Accepted" : "Wrong Answer";

    const firstAC =
      verdict === "Accepted" &&
      !(await Submission.exists({
        problem: problemId,
        user,
        verdict: "Accepted",
      }));

    if (firstAC) {
      await Problem.findByIdAndUpdate(problemId, { $inc: { solvedCount: 1 } });
      console.log(`🎉 First AC for user ${user}`);
    }

    const submission = await Submission.create({
      problem: problemId,
      user,
      code,
      language: normalizedLanguage,
      verdict,
      testCaseResults: results,
    });

    console.log(`📦 Verdict for User=${user}: ${verdict}`);

    return res.status(201).json({
      submissionId: submission._id,
      verdict,
      testCasesPassed: results.filter((r) => r.passed).length,
      totalTestCases: results.length,
      submittedAt: submission.createdAt,
    });
  } catch (err) {
    console.error(`🚨 Internal Error: ${err.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Fetch submissions for a problem by user
// Fetch submissions for a problem by user
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
