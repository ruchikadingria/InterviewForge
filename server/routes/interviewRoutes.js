import express from "express";
import {
  startInterview,
  getInterviewSession,
  submitAnswer,
  getInterviewResult,
  getInterviewHistory,
} from "../controllers/interviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/start", protect, startInterview);

// Interview History
router.get("/history", protect, getInterviewHistory);

router.get("/:sessionId", protect, getInterviewSession);
router.post("/:sessionId/answer", protect, submitAnswer);
router.get("/result/:resultId", protect, getInterviewResult);

export default router;