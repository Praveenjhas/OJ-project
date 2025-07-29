// src/pages/ProblemDetail.jsx

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProblemById } from "../services/problemService";
import {
  submitSolution,
  fetchSubmissions,
} from "../services/submissionService";
import Editor from "@monaco-editor/react";

export default function ProblemDetail() {
  const { id } = useParams();
  const userId = localStorage.getItem("userId");

  const [problem, setProblem] = useState(null);
  const [subs, setSubs] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [code, setCode] = useState("// write your code here");
  const [lang, setLang] = useState("cpp");
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const prob = await fetchProblemById(id);
        setProblem(prob);

        const history = await fetchSubmissions({ problemId: id });
        setSubs(history);
        setSolved(history.some((s) => s.verdict === "Accepted"));
      } catch (e) {
        console.error(e);
        setError("Failed to load problem.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async () => {
    if (!userId) {
      alert("Please log in to submit.");
      return;
    }
    setSubmitting(true);
    try {
      const submission = await submitSolution({
        problem: id,
        user: userId,
        code,
        language: lang,
      });
      setSubs((prev) => [submission, ...prev]);
      if (submission.testCaseResults) setResults(submission.testCaseResults);
      if (submission.verdict === "Accepted") setSolved(true);
    } catch (e) {
      console.error(e);
      alert("Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return <div className="p-6 text-center text-gray-600">Loading…</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Sidebar: Problem */}
      <aside className="w-1/3 p-6 overflow-auto border-r bg-white">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{problem.title}</h1>
          <span
            className={`font-semibold ${
              solved ? "text-green-600" : "text-red-500"
            }`}
          >
            {solved ? "✔ Solved" : "✘ Unsolved"}
          </span>
        </header>

        <div className="text-sm text-gray-600 flex flex-wrap gap-2 mb-4">
          <div>
            <strong>Difficulty:</strong>{" "}
            <span
              className={
                problem.difficulty === "Easy"
                  ? "text-green-600"
                  : problem.difficulty === "Medium"
                  ? "text-yellow-600"
                  : "text-red-600"
              }
            >
              {problem.difficulty}
            </span>
          </div>
          <div>
            <strong>Categories:</strong> {problem.categories.join(", ")}
          </div>
          <div>
            <strong>Solved:</strong> {problem.solvedCount}
          </div>
          {problem.timeLimit && (
            <div>
              <strong>Time:</strong> {problem.timeLimit} ms
            </div>
          )}
          {problem.memoryLimit && (
            <div>
              <strong>Memory:</strong> {problem.memoryLimit} MB
            </div>
          )}
        </div>

        <div
          className="prose prose-sm max-w-none mb-6"
          dangerouslySetInnerHTML={{ __html: problem.description }}
        />

        {problem.constraints?.length > 0 && (
          <div className="bg-gray-50 p-3 rounded-md border mb-6">
            <h3 className="font-semibold mb-2">Constraints</h3>
            <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
              {problem.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-gray-50 p-3 rounded-md border space-y-4">
          <div>
            <h3 className="font-semibold">Sample Input</h3>
            <pre className="bg-white p-2 rounded text-sm border text-gray-800">
              {problem.sampleInputs?.join("\n") || "N/A"}
            </pre>
          </div>
          <div>
            <h3 className="font-semibold">Sample Output</h3>
            <pre className="bg-white p-2 rounded text-sm border text-gray-800">
              {problem.sampleOutputs?.join("\n") || "N/A"}
            </pre>
          </div>
        </div>
      </aside>

      {/* Right Main: Editor + Results */}
      <main className="w-2/3 p-6 flex flex-col">
        <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
          {/* Monaco Editor fills */}
          <Editor
            height="100%"
            defaultLanguage={lang}
            value={code}
            onChange={setCode}
            theme="vs-dark"
          />
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center space-x-3">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="cpp">C++</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`px-6 py-2 rounded-md font-semibold text-white transition ${
              submitting
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>

        {/* Test Case Results */}
        {results.length > 0 && (
          <div className="mt-6 bg-white rounded-md shadow-inner p-4">
            <h2 className="font-semibold mb-2">Test Case Results</h2>
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-1 px-2 border">Input</th>
                  <th className="py-1 px-2 border">Expected</th>
                  <th className="py-1 px-2 border">Your Output</th>
                  <th className="py-1 px-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="even:bg-gray-50">
                    <td className="py-1 px-2 border">{r.input}</td>
                    <td className="py-1 px-2 border">{r.expectedOutput}</td>
                    <td className="py-1 px-2 border">{r.userOutput}</td>
                    <td
                      className={`py-1 px-2 border font-medium ${
                        r.passed ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {r.passed ? "✔" : "✘"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Submission History */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Submission History</h2>
          {subs.length === 0 ? (
            <p className="text-gray-500">No submissions yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {subs.map((s) => (
                <li key={s._id} className="flex justify-between">
                  <span className="text-gray-600">
                    [{new Date(s.submittedAt).toLocaleTimeString()}]
                  </span>
                  <span
                    className={`font-medium ${
                      s.verdict === "Accepted"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {s.verdict}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
