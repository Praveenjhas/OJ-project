import { useState } from "react";
import Modal from "./Modal";
import Editor from "@monaco-editor/react";

export default function SubmissionTable({ submissions }) {
  const [viewing, setViewing] = useState(null);

  return (
    <>
      <div className="bg-white rounded shadow overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              {[
                "Time",
                "Verdict",
                "Runtime (ms)",
                "Memory (MB)",
                "Lang",
                "Code",
              ].map((header) => (
                <th key={header} className="px-4 py-3 text-left font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s._id} className="even:bg-gray-50 hover:bg-gray-100">
                <td className="px-4 py-2">
                  {new Date(s.submittedAt).toLocaleString()}
                </td>
                <td
                  className={`px-4 py-2 font-semibold ${
                    s.verdict === "Accepted" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {s.verdict}
                </td>
                <td className="px-4 py-2">{s.executionTime ?? "–"}</td>
                <td className="px-4 py-2">{s.memoryUsed?.toFixed(2) ?? "–"}</td>
                <td className="px-4 py-2 uppercase">{s.language}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => setViewing(s)}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewing && (
        <Modal onClose={() => setViewing(null)}>
          <h2 className="text-xl font-bold mb-4">Submission Code</h2>
          <Editor
            height="60vh"
            language={viewing.language}
            value={viewing.code}
            options={{ readOnly: true, minimap: { enabled: false } }}
            theme="vs-dark"
          />

          {/* Show error message if any */}
          {viewing.errorMessage && (
            <>
              <h3 className="mt-4 mb-1 font-semibold">Error Message:</h3>
              <pre className="bg-gray-100 p-3 rounded whitespace-pre-wrap text-sm text-red-700">
                {viewing.errorMessage}
              </pre>
            </>
          )}

          {/* Show detailed failed test cases for Wrong Answer */}
          {viewing.testCaseResults && viewing.verdict === "Wrong Answer" && (
            <>
              <h3 className="mt-4 mb-1 font-semibold">Failed Test Case(s):</h3>
              {viewing.testCaseResults
                .filter((tc) => !tc.passed)
                .map((fail, idx) => (
                  <div
                    key={idx}
                    className="mb-3 border border-red-300 rounded p-3 bg-red-50"
                  >
                    <p>
                      <strong>Input:</strong>
                    </p>
                    <pre className="whitespace-pre-wrap">{fail.input}</pre>
                    <p>
                      <strong>Expected Output:</strong>
                    </p>
                    <pre className="whitespace-pre-wrap">
                      {fail.expectedOutput}
                    </pre>
                    <p>
                      <strong>Your Output:</strong>
                    </p>
                    <pre className="whitespace-pre-wrap">{fail.userOutput}</pre>
                    {fail.error && (
                      <>
                        <p>
                          <strong>Error:</strong>
                        </p>
                        <pre className="whitespace-pre-wrap text-red-700">
                          {fail.error}
                        </pre>
                      </>
                    )}
                  </div>
                ))}
            </>
          )}
        </Modal>
      )}
    </>
  );
}
