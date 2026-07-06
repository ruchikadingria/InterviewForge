import { createInterviewSession ,fetchInterviewSession} from "../services/interviewService.js";

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