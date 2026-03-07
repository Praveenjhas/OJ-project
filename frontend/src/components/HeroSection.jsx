import React from "react";
import { Link } from "react-router-dom";

const stats = [
  { label: "Problems", value: "250+" },
  { label: "Daily Submissions", value: "10k+" },
  { label: "Active Learners", value: "3k+" },
  { label: "Discussion Threads", value: "500+" },
];

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 md:py-20 lg:grid-cols-2 lg:px-10">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
            CodeZone Online Judge
          </p>
          <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">
            Practice DSA like real coding interviews.
          </h1>
          <p className="mt-5 max-w-xl text-base text-slate-300 md:text-lg">
            Solve curated problems, submit in C++/Java/Python, and grow with a
            focused community of developers.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/problems"
              className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Start Solving
            </Link>
            <Link
              to="/discussions"
              className="rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/60 hover:bg-white/10"
            >
              Explore Discussions
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 shadow-2xl backdrop-blur">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-300">
            Platform Overview
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-700 bg-slate-950 p-4"
              >
                <p className="text-2xl font-extrabold text-white">{item.value}</p>
                <p className="mt-1 text-xs text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Tip: Solve 3 problems daily and review one previous mistake before
            new submissions.
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
