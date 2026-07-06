import express from "express";
import {
  startInterview,
  getInterviewSession,
} from "../controllers/interviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/start", protect, startInterview);
router.get("/:sessionId", protect, getInterviewSession);

export default router;