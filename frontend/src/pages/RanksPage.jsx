import { useEffect, useMemo, useState } from "react";
import { fetchLeaderboard } from "../services/rankService";
import Navbar from "../components/Navbar";

const REFRESH_MS = 15000;

export default function RanksPage() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const myUsername = localStorage.getItem("username");

  async function loadLeaderboard() {
    try {
      setError("");
      const data = await fetchLeaderboard(100);
      setLeaders(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError("Failed to load leaderboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    (async () => {
      if (!active) return;
      await loadLeaderboard();
    })();

    const timer = setInterval(() => {
      if (active) loadLeaderboard();
    }, REFRESH_MS);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const topThree = useMemo(() => leaders.slice(0, 3), [leaders]);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
        <header className="mb-6 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-800 px-6 py-7 text-white">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Leaderboard
          </h1>
          <p className="mt-2 text-sm text-slate-200">
            Top users ranked by number of problems solved.
          </p>
          <div className="mt-3 text-xs text-cyan-100">
            Auto-refresh every {REFRESH_MS / 1000}s
            {lastUpdated ? ` | Last updated: ${lastUpdated.toLocaleTimeString()}` : ""}
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Loading ranks...
          </div>
        ) : (
          <>
            <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {topThree.map((u) => (
                <article
                  key={u.username}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Rank #{u.rank}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">{u.username}</h2>
                  <p className="mt-2 text-sm text-blue-700">{u.solvedCount} solved</p>
                </article>
              ))}
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Rank</th>
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Solved Problems</th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.map((u) => {
                    const mine = myUsername && u.username === myUsername;
                    return (
                      <tr
                        key={u.username}
                        className={`border-t border-slate-100 ${mine ? "bg-cyan-50" : "hover:bg-slate-50"}`}
                      >
                        <td className="px-4 py-3 font-semibold text-slate-800">#{u.rank}</td>
                        <td className="px-4 py-3 text-slate-800">
                          {u.username} {mine ? <span className="text-xs text-cyan-700">(You)</span> : ""}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{u.solvedCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
