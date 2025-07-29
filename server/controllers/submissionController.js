import Submission from "../models/Submission.js";
import Problem from "../models/Problem.js";
import { runUserCode } from "../utils/codeExecutor.js";

function normalizeAndCompare(uOut, eOut) {
  const uLines = uOut
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim());
  const eLines = eOut
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim());
  if (uLines.length !== eLines.length) return false;
  return uLines.every((l, i) => l === eLines[i]);
}

export const submitSolution = async (req, res) => {
  try {
    const { problem: problemId, user, code, language } = req.body;
    console.log(
      `📥 [submitSolution] User=${user}, Lang=${language}, Problem=${problemId}`
    );

    const problem = await Problem.findById(problemId);
    if (!problem) {
      console.log(`❌ [submitSolution] Problem not found`);
      return res.status(404).json({ error: "Problem not found" });
    }

    const results = [];
    let allPassed = true;

    for (const tc of problem.testCases) {
      console.log(`🧪 [submitSolution] Running test case:`, tc.input);
      let userOutput = "",
        passed = false,
        error = null;
      try {
        const result = await runUserCode({
          code,
          language,
          input: tc.input,
          timeLimitMs: problem.timeLimit,
        });
        if (result.error) {
          error = result.error;
          console.log(`❌ [submitSolution] Execution error:\n${error}`);
        } else {
          userOutput = result.output;
          passed = normalizeAndCompare(userOutput, tc.expectedOutput);
          console.log(`✅ [submitSolution] Passed: ${passed}`);
        }
      } catch (err) {
        error = err.message;
        console.log(`🔥 [submitSolution] Exception: ${error}`);
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
    console.log(`🏁 [submitSolution] Verdict: ${verdict}`);

    const firstAC =
      verdict === "Accepted" &&
      !(await Submission.exists({
        problem: problemId,
        user,
        verdict: "Accepted",
      }));

    if (firstAC) {
      await Problem.findByIdAndUpdate(problemId, { $inc: { solvedCount: 1 } });
      console.log(`🎉 [submitSolution] First AC for user ${user}`);
    }

    const submission = await Submission.create({
      problem: problemId,
      user,
      code,
      language,
      verdict,
      testCaseResults: results,
    });

    return res.status(201).json({
      _id: submission._id,
      verdict,
      submittedAt: submission.createdAt,
      testCaseResults: results,
    });
  } catch (err) {
    console.error(`🚨 [submitSolution] Internal Error:`, err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSubmissionsByProblem = async (req, res) => {
  try {
    const userId = req.user;
    const { problemId } = req.query;

    if (!userId) {
      console.log("⚠️ [getSubmissions] Unauthorized");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!problemId) {
      return res.status(400).json({
        success: false,
        message: "problemId is required",
      });
    }

    const subs = await Submission.find({ problem: problemId, user: userId })
      .sort({ submittedAt: -1 })
      .lean();

    return res.status(200).json({ success: true, submissions: subs });
  } catch (err) {
    console.error("🔥 [getSubmissionsByProblem] Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
