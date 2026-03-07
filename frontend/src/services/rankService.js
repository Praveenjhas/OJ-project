import api from "./api";

export async function fetchLeaderboard(limit = 50) {
  const res = await api.get("/ranks", { params: { limit } });
  return res.data?.leaderboard || [];
}

