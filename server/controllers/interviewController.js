import {
  createInterviewSession,
  fetchInterviewSession,
  saveInterviewAnswer,
  fetchInterviewResult,
  fetchInterviewHistory,
} from "../services/interviewService.js";

export const startInterview = async (req, res) => {
  try {
    const { role, mode } = req.body;

    const result = await createInterviewSession({
      userId: req.user._id,
      role,
      mode,
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getInterviewSession = async (req, res) => {
  try {
    const result = await fetchInterviewSession({
      userId: req.user._id,
      sessionId: req.params.sessionId,
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { answer } = req.body;

    const result = await saveInterviewAnswer({
      userId: req.user._id,
      sessionId: req.params.sessionId,
      answer,
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getInterviewResult = async (req, res) => {
  try {
    const result = await fetchInterviewResult({
      userId: req.user._id,
      resultId: req.params.resultId,
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getInterviewHistory = async (req, res) => {
  try {
    const result = await fetchInterviewHistory({
      userId: req.user._id,
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};