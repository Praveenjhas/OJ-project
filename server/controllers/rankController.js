import User from "../models/User.js";

export const getLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || "50", 10), 1), 200);

    const users = await User.aggregate([
      {
        $project: {
          username: 1,
          solvedCount: { $size: { $ifNull: ["$solvedProblems", []] } },
        },
      },
      { $sort: { solvedCount: -1, username: 1 } },
      { $limit: limit },
    ]);

    const ranked = users.map((u, idx) => ({
      rank: idx + 1,
      username: u.username,
      solvedCount: u.solvedCount,
    }));

    return res.status(200).json({ success: true, leaderboard: ranked });
  } catch (err) {
    console.error("getLeaderboard error:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

