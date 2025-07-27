const categories = ["All", "Arrays", "Graphs", "DP", "Strings", "Greedy"];
const difficulties = ["All", "Easy", "Medium", "Hard"];

const FilterSidebar = ({
  category,
  setCategory,
  difficulty,
  setDifficulty,
}) => {
  return (
    <div className="w-60 p-6 bg-white shadow-md space-y-6">
      <div>
        <h2 className="font-bold text-lg mb-2">Categories</h2>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`block w-full text-left px-3 py-2 rounded-md mb-1 ${
              category === cat
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div>
        <h2 className="font-bold text-lg mb-2">Difficulty</h2>
        {difficulties.map((diff) => (
          <button
            key={diff}
            onClick={() => setDifficulty(diff)}
            className={`block w-full text-left px-3 py-2 rounded-md mb-1 ${
              difficulty === diff
                ? "bg-purple-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {diff}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterSidebar;
