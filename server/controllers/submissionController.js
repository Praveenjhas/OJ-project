// server/controllers/submissionController.js
import mongoose from "mongoose";
import Submission from "../models/Submission.js";
import Problem from "../models/Problem.js";
import User from "../models/User.js";
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

// Map raw runner verdicts / signals / stats into canonical verdict strings.
// Minimal, defensive mapping so noisy runner outputs don't break judge logic.
function mapRunnerVerdict(runnerResult, memoryLimitMb) {
  const rawVerdict = (runnerResult?.verdict || "").toString().trim();
  const exitCode = Number(runnerResult?.exitCode ?? NaN);
  const maxMemKB = Number(runnerResult?.resourceStats?.maxMemoryKB ?? NaN);

  // gather outputs to search for textual indicators (lowercased)
  const stdout = (runnerResult?.output || "").toString().toLowerCase();
  const rawStdout = (runnerResult?.rawDockerStdout || "")
    .toString()
    .toLowerCase();
  const rawStderr = (runnerResult?.rawDockerStderr || "")
    .toString()
    .toLowerCase();
  const errMsg = (runnerResult?.error || "").toString().toLowerCase();

  // Normalize common textual variants
  const normalized = rawVerdict.replace(/\.+$/, "").toLowerCase();

  // Direct mappings
  if (normalized === "accepted") return "Accepted";
  if (normalized.includes("time limit")) return "Time Limit Exceeded";
  if (normalized.includes("memory limit")) return "Memory Limit Exceeded";
  if (normalized.includes("compilation")) return "Compilation Error";
  if (normalized.includes("command not")) return "Runtime Error";
  if (normalized.includes("execution failed")) return "Runtime Error";
  if (normalized === "error") return "Error";

  // Heuristics: check textual indicators across stdout/stderr/raw fields
  const combinedText = `${stdout}\n${rawStdout}\n${rawStderr}\n${errMsg}`;

  // detect C++ new throwing bad_alloc, or similar messages
  if (/\b(bad_alloc|bad alloc|std::bad_alloc)\b/i.test(combinedText)) {
    return "Memory Limit Exceeded";
  }

  // java OOM detection (keeps your earlier checks)
  if (
    combinedText.includes("outofmemory") ||
    combinedText.includes("out of memory") ||
    combinedText.includes("java.lang.outofmemoryerror")
  ) {
    return "Memory Limit Exceeded";
  }

  // 'killed' or 'oom' in stderr is a good signal
  if (combinedText.includes("killed") || combinedText.includes("oom")) {
    return "Memory Limit Exceeded";
  }

  // exit code 137 => SIGKILL (often OOM / forced kill)
  if (exitCode === 137) return "Memory Limit Exceeded";

  // If resource stats show peak RSS >= allowed memory => MLE
  if (!Number.isNaN(maxMemKB) && !Number.isNaN(memoryLimitMb)) {
    const allowedKB = memoryLimitMb * 1024;
    if (maxMemKB >= allowedKB) return "Memory Limit Exceeded";
  }

  // Fallback: if runner returned non-zero but none of the above matched -> Runtime Error
  if (!Number.isNaN(exitCode) && exitCode !== 0) return "Runtime Error";

  // default: return the raw label capitalized-ish
  if (rawVerdict) {
    return rawVerdict;
  }

  // ultimate fallback
  return "Runtime Error";
}

export const submitSolution = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { problem: problemId, code, language } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!problemId || !code || !language) {
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

    const memoryLimitMb =
      Number(
        problem.memoryLimitMb ?? problem.memoryLimit ?? problem.memoryLimitMB,
      ) || 512;

    const results = [];
    let verdict = "Accepted";

    for (const tc of problem.testCases) {
      const r = await runUserCode({
        code,
        language: lang,
        input: tc.input,
        timeLimitMs: problem.timeLimit,
        memoryLimitMb,
      });

      const secs = r.resourceStats?.userTimeSec ?? 0;
      const kb = r.resourceStats?.maxMemoryKB ?? 0;
      const mappedVerdict = mapRunnerVerdict(r, memoryLimitMb);

      let passed = false;
      if (mappedVerdict === "Accepted") {
        passed = normalizeAndCompare(r.output, tc.expectedOutput);
        if (!passed) verdict = "Wrong Answer";
      } else {
        verdict = mappedVerdict;
      }

      results.push({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        userOutput: r.output || "",
        passed,
        error: r.error || null,
        verdict: mappedVerdict,
        executionTime: secs != null ? secs * 1000 : null,
        memoryUsed: kb != null && !Number.isNaN(kb) ? kb / 1024 : null,
      });

      if (verdict !== "Accepted") break;
    }

    const last = results[results.length - 1] || {};
    const executionTime = last.executionTime ?? null;
    const memoryUsed = last.memoryUsed ?? null;

    const submission = await Submission.create({
      problem: problemId,
      user: userId, // use JWT user id
      code,
      language: lang,
      verdict,
      executionTime,
      memoryUsed,
      testCaseResults: results,
    });

    // Realtime solved-tracking:
    // If this submission is Accepted and this is user's first solve for this problem,
    // add the problem to user's solved list and increment problem solvedCount once.
    if (verdict === "Accepted") {
      const solvedUpdate = await User.updateOne(
        { _id: userId, solvedProblems: { $ne: problemId } },
        { $addToSet: { solvedProblems: problemId } },
      );

      if ((solvedUpdate.modifiedCount || 0) > 0) {
        await Problem.updateOne({ _id: problemId }, { $inc: { solvedCount: 1 } });
      }
    }

    return res.status(201).json({
      submissionId: submission._id,
      verdict,
      executionTime,
      memoryUsed,
      testCaseResults: results,
      submittedAt: submission.submittedAt,
    });
  } catch (err) {
    console.error("submitSolution error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSubmissionsByProblem = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { problemId } = req.query;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
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
        "_id verdict executionTime memoryUsed submittedAt language code testCaseResults",
      )
      .lean();

    return res.status(200).json({ success: true, submissions: subs });
  } catch (err) {
    console.error(" getSubmissionsByProblem error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
