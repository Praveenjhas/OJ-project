const sampleProblems = [
  {
    id: 1,
    title: "Two Sum",
    category: "Arrays",
    difficulty: "Easy",
    attempts: 1023,
  },
  {
    id: 2,
    title: "Dijkstra's Algo",
    category: "Graphs",
    difficulty: "Medium",
    attempts: 782,
  },
  {
    id: 3,
    title: "Knapsack",
    category: "DP",
    difficulty: "Hard",
    attempts: 512,
  },
  // ...add more
];

const ProblemTable = ({ category, difficulty }) => {
  const filtered = sampleProblems.filter((prob) => {
    const catMatch = category === "All" || prob.category === category;
    const diffMatch = difficulty === "All" || prob.difficulty === difficulty;
    return catMatch && diffMatch;
  });

  return (
    <div className="flex-1 p-6">
      <h1 className="text-2xl font-bold mb-4">Problems</h1>
      <table className="w-full bg-white rounded-md overflow-hidden shadow-md">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="text-left p-3">#</th>
            <th className="text-left p-3">Title</th>
            <th className="text-left p-3">Category</th>
            <th className="text-left p-3">Difficulty</th>
            <th className="text-left p-3">Attempts</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((prob, idx) => (
            <tr key={prob.id} className="border-t hover:bg-gray-100">
              <td className="p-3">{idx + 1}</td>
              <td className="p-3 font-medium text-blue-600 hover:underline cursor-pointer">
                {prob.title}
              </td>
              <td className="p-3">{prob.category}</td>
              <td
                className={`p-3 font-semibold ${
                  prob.difficulty === "Easy"
                    ? "text-green-600"
                    : prob.difficulty === "Medium"
                    ? "text-yellow-500"
                    : "text-red-600"
                }`}
              >
                {prob.difficulty}
              </td>
              <td className="p-3">{prob.attempts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProblemTable;
