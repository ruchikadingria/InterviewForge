import {
  createDSASession,
  fetchDSASession,
  saveDSASolution,
  submitDSAAssessment,
  fetchDSAResult,
  fetchDSAHistory,
  runDSACode,
} from "../services/dsaService.js";

export const startDSAAssessment = async (req, res) => {
  try {
    const { language } = req.body || {};

    const result = await createDSASession({
      userId: req.user._id,
      language,
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getDSASession = async (req, res) => {
  try {
    const result = await fetchDSASession({
      userId: req.user._id,
      sessionId: req.params.sessionId,
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const saveCode = async (req, res) => {
  try {
    const { questionId, code } = req.body || {};

    const result = await saveDSASolution({
      userId: req.user._id,
      sessionId: req.params.sessionId,
      questionId,
      code,
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const runCode = async (req, res) => {
  try {
    const { questionId, code, stdin = "" } = req.body || {};

    const result = await runDSACode({
      userId: req.user._id,
      sessionId: req.params.sessionId,
      questionId,
      code,
      stdin,
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const submitAssessment = async (req, res) => {
  try {
    const result = await submitDSAAssessment({
      userId: req.user._id,
      sessionId: req.params.sessionId,
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getDSAResult = async (req, res) => {
  try {
    const result = await fetchDSAResult({
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

export const getDSAHistory = async (req, res) => {
  try {
    const result = await fetchDSAHistory({
      userId: req.user._id,
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};