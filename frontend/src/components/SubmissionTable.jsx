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
              {["Time", "Verdict", "Runtime", "Memory", "Lang", "Code"].map(
                (h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">
                    {h}
                  </th>
                )
              )}
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
                    s.verdict === "Accepted" ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {s.verdict}
                </td>
                <td className="px-4 py-2">{s.executionTime ?? "–"} ms</td>
                <td className="px-4 py-2">{s.memoryUsed ?? "–"} MB</td>
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
        </Modal>
      )}
    </>
  );
}
