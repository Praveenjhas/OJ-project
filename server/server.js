// server/src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import discussionRoutes from "./routes/discussionRoutes.js";
import rankRoutes from "./routes/rankRoutes.js";

dotenv.config();
const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// health‑check
app.get("/api/health", (req, res) =>
  res.json({ status: "OK", time: new Date().toISOString() }),
);

// mount routers
app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/ranks", rankRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(` Server listening on http://localhost:${PORT}`),
);
