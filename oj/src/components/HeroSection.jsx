import React from "react";
const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-br from-indigo-800 to-purple-900 text-white py-20 px-6 md:px-20 overflow-hidden">
      {/* Glowing gradient circle */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-purple-400 rounded-full opacity-20 blur-3xl z-0" />
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
          Become the <span className="text-yellow-300">Next Code Master</span>
        </h1>

        <p className="text-xl md:text-2xl font-light mb-8 text-gray-200">
          Solve real-world problems. Compete with others. Improve your DSA.
        </p>

        <button className="bg-yellow-400 text-black font-bold px-6 py-3 rounded-full hover:bg-yellow-300 transition duration-300 shadow-lg hover:scale-105">
          Start Solving Now
        </button>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
          {[
            { label: "Problems", value: "7,500+" },
            { label: "Users", value: "1.2M+" },
            { label: "Submissions", value: "35M+" },
            { label: "Contests", value: "500+" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white/10 backdrop-blur-md rounded-xl py-4 px-4 shadow-md hover:shadow-xl transition duration-300"
            >
              <h3 className="text-2xl font-bold text-yellow-300">
                {item.value}
              </h3>
              <p className="text-sm tracking-wide mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
