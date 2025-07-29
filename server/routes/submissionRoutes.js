// server/src/routes/submissionRoutes.js
import express from "express";
import {
  submitSolution,
  getSubmissionsByProblem,
} from "../controllers/submissionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// protect both endpoints so only logged‑in users can submit or view
router.post("/", protect, submitSolution);
router.get("/", protect, getSubmissionsByProblem);

export default router;
