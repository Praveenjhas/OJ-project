import { useEffect, useState, useCallback } from "react";
import { fetchProblems } from "../services/problemService";
import { Link } from "react-router-dom";

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];
const CATEGORIES = [
  "All",
  "Arrays",
  "Strings",
  "DP",
  "Greedy",
  "Graphs",
  "Math",
  "HashMap",
  "Sliding Window",
];

export default function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  const loadProblems = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {};
      if (selectedDifficulty !== "All") filters.difficulty = selectedDifficulty;
      if (selectedCategory !== "All") filters.category = selectedCategory;

      // pass userId so backend can mark solvedByUser
      const userId = localStorage.getItem("userId");
      if (userId) filters.userId = userId;

      const data = await fetchProblems(filters);
      setProblems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedDifficulty, selectedCategory]);

  useEffect(() => {
    loadProblems();
  }, [loadProblems]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-6">Filters</h2>
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Category</h3>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              aria-pressed={selectedCategory === cat}
              className={`block w-full text-left px-3 py-2 mb-1 rounded-md transition ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "hover:bg-blue-100 text-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div>
          <h3 className="font-semibold mb-2">Difficulty</h3>
          {DIFFICULTIES.map((level) => (
            <button
              key={level}
              onClick={() => setSelectedDifficulty(level)}
              aria-pressed={selectedDifficulty === level}
              className={`block w-full text-left px-3 py-2 mb-1 rounded-md transition ${
                selectedDifficulty === level
                  ? "bg-green-600 text-white"
                  : "hover:bg-green-100 text-gray-700"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </aside>

      {/* Table */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Problems</h1>
        <div className="overflow-x-auto rounded-lg shadow-sm border bg-white">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 border">S.No</th>
                <th className="px-4 py-3 border">Title</th>
                <th className="px-4 py-3 border">Difficulty</th>
                <th className="px-4 py-3 border">Categories</th>
                <th className="px-4 py-3 border">Solved By</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : problems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    No problems found.
                  </td>
                </tr>
              ) : (
                problems.map((p, idx) => (
                  <tr
                    key={p._id}
                    className="hover:bg-gray-50 border-t transition"
                  >
                    <td className="px-4 py-3 border">{idx + 1}</td>
                    <td className="px-4 py-3 border">
                      <Link
                        to={`/problems/${p._id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td
                      className={`px-4 py-3 border font-semibold ${
                        {
                          Easy: "text-green-600",
                          Medium: "text-yellow-600",
                          Hard: "text-red-600",
                        }[p.difficulty]
                      }`}
                    >
                      {p.difficulty}
                    </td>
                    <td className="px-4 py-3 border">
                      {p.categories.join(", ")}
                    </td>
                    <td className="px-4 py-3 border">
                      {p.solvedByUser ? "✔ You" : `${p.solvedCount} users`}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
