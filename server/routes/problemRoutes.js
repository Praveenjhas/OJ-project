import express from "express";
import {
  getAllProblems,
  getProblemById,
} from "../controllers/problemController.js";
const router = express.Router();

// Public: fetch all problems and one problem
router.get("/", getAllProblems);
router.get("/:id", getProblemById);

export default router;
