// src/pages/HomePage.jsx
import React from "react";
import Navbar from "../components/Navbar.jsx";
import HeroSection from "../components/HeroSection.jsx";
import { Link } from "react-router-dom";

const tracks = [
  {
    title: "Foundation Track",
    text: "Arrays, strings, hash maps, and pattern-based easy problems.",
  },
  {
    title: "Interview Track",
    text: "Medium-level DP, greedy, and sliding window sets for interviews.",
  },
  {
    title: "Advanced Track",
    text: "Hard graph and optimization problems with strict constraints.",
  },
];

function HomePage() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <HeroSection />

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
              Structured Learning
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">
              Choose the right problem set
            </h2>
          </div>
          <Link
            to="/problems"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            View All Problems
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {tracks.map((track) => (
            <article
              key={track.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-lg font-bold text-slate-900">{track.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{track.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-14 lg:grid-cols-2 lg:px-10">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-xl font-black text-slate-900">
              Write. Submit. Improve.
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li>1. Multi-language submissions in C++, Java, and Python.</li>
              <li>2. Test case verdicts with time and memory insights.</li>
              <li>3. Retry fast and track progress from your submissions tab.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
            <h3 className="text-xl font-black text-slate-900">
              Discuss and learn faster
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li>1. Share approaches, edge cases, and strategy posts.</li>
              <li>2. Ask follow-up questions in threaded comments.</li>
              <li>3. Build public problem-solving consistency.</li>
            </ul>
            <Link
              to="/discussions"
              className="mt-5 inline-block rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Go to Discussions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
