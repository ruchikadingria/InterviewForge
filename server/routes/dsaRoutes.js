import express from "express";
import {
  startDSAAssessment,
  getDSASession,
  saveCode,
  runCode,
  submitAssessment,
  getDSAResult,
  getDSAHistory,
} from "../controllers/dsaController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/start", protect, startDSAAssessment);

router.get("/history", protect, getDSAHistory);
router.get("/result/:resultId", protect, getDSAResult);

router.post("/:sessionId/save", protect, saveCode);
router.post("/:sessionId/run", protect, runCode);
router.post("/:sessionId/submit", protect, submitAssessment);

router.get("/:sessionId", protect, getDSASession);

export default router;