import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchProblemById } from "../services/problemService";
import {
  submitSolution,
  fetchSubmissionsByProblem,
} from "../services/submissionService";
import Editor from "@monaco-editor/react";
import SubmissionTable from "../components/SubmissionTable";

const TABS = ["Code", "My Submissions"];

export default function ProblemDetail() {
  const { id } = useParams();
  const userId = localStorage.getItem("userId");

  const [problem, setProblem] = useState(null);
  const [subs, setSubs] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState(TABS[0]);

  const [code, setCode] = useState("// write your code here");
  const [lang, setLang] = useState("cpp");
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const prob = await fetchProblemById(id);
        setProblem(prob);

        const history = await fetchSubmissionsByProblem(id);
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
    if (!userId) return alert("Please log in to submit.");
    setSubmitting(true);
    setResults([]);
    try {
      const submission = await submitSolution({
        problem: id,
        user: userId,
        code,
        language: lang,
      });
      setSubs((prev) => [
        {
          _id: submission.submissionId,
          verdict: submission.verdict,
          executionTime: submission.executionTime,
          memoryUsed: submission.memoryUsed,
          submittedAt: submission.submittedAt,
          language: lang,
          code,
          testCaseResults: submission.testCaseResults || [],
          errorMessage: submission.errorMessage || null,
        },
        ...prev,
      ]);
      setResults(submission.testCaseResults || []);
      if (submission.verdict === "Accepted") setSolved(true);
      setTab(TABS[1]); // Switch to submissions tab to view results
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
      {/* Problem Sidebar */}
      <aside className="w-1/3 p-6 overflow-auto border-r bg-white">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{problem.title}</h1>
          <span
            className={`font-semibold ${
              solved ? "text-green-600" : "text-red-500"
            }`}
          >
            {solved ? "✔ Solved" : "✘ Unsolved"}
          </span>
        </header>
        {/* Meta */}
        <div className="flex flex-wrap gap-4 text-sm mb-6 text-gray-600">
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
            <strong>Time Limit:</strong> {problem.timeLimit} ms
          </div>
          <div>
            <strong>Memory Limit:</strong> {problem.memoryLimit} MB
          </div>
        </div>
        {/* Description */}
        <div
          className="prose prose-sm max-w-none text-gray-800 mb-6"
          dangerouslySetInnerHTML={{ __html: problem.description }}
        />
        {/* Constraints & Samples */}
        {problem.constraints?.length > 0 && (
          <div className="bg-gray-50 p-4 rounded border mb-6">
            <h3 className="font-semibold mb-2">Constraints</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              {problem.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded border">
            <h3 className="font-semibold mb-1">Sample Input</h3>
            <pre className="bg-white p-2 rounded text-sm border">
              {problem.sampleInputs?.join("\n")}
            </pre>
          </div>
          <div className="bg-gray-50 p-4 rounded border">
            <h3 className="font-semibold mb-1">Sample Output</h3>
            <pre className="bg-white p-2 rounded text-sm border">
              {problem.sampleOutputs?.join("\n")}
            </pre>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="w-2/3 p-6 flex flex-col">
        {/* Tabs */}
        <div className="flex border-b mb-4">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2 -mb-px font-medium ${
                tab === t
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Code Tab */}
        {tab === "Code" && (
          <div className="flex flex-col flex-1">
            <div className="bg-white rounded-lg shadow overflow-hidden flex-1 mb-4">
              <Editor
                height="500px"
                defaultLanguage={lang}
                value={code}
                onChange={setCode}
                theme="vs-dark"
              />
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="px-4 py-2 border rounded-md bg-white"
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
          </div>
        )}

        {/* Submissions Tab */}
        {tab === "My Submissions" && (
          <div className="flex-1 overflow-auto">
            <SubmissionTable submissions={subs} />
            {/* Optionally show test case detailed results for last submission */}
            {results.length > 0 && (
              <>
                <h3 className="mt-6 mb-2 font-semibold">Test Case Results</h3>
                <div className="overflow-auto max-h-80 border rounded shadow bg-white p-4">
                  {results.map((tc, idx) => (
                    <div
                      key={idx}
                      className={`mb-4 p-3 rounded border ${
                        tc.passed
                          ? "border-green-300 bg-green-50"
                          : "border-red-300 bg-red-50"
                      }`}
                    >
                      <p>
                        <strong>Test Case {idx + 1}:</strong>{" "}
                        {tc.passed ? (
                          <span className="text-green-600">Passed</span>
                        ) : (
                          <span className="text-red-600">Failed</span>
                        )}
                      </p>
                      <p>
                        <strong>Input:</strong>
                      </p>
                      <pre className="whitespace-pre-wrap">{tc.input}</pre>
                      <p>
                        <strong>Expected Output:</strong>
                      </p>
                      <pre className="whitespace-pre-wrap">
                        {tc.expectedOutput}
                      </pre>
                      <p>
                        <strong>Your Output:</strong>
                      </p>
                      <pre className="whitespace-pre-wrap">
                        {tc.userOutput || "No Output"}
                      </pre>
                      {tc.error && (
                        <>
                          <p>
                            <strong>Error:</strong>
                          </p>
                          <pre className="whitespace-pre-wrap text-red-600">
                            {tc.error}
                          </pre>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
