import { Resume } from "../models/Resume.js";
import { InterviewSession } from "../models/InterviewSession.js";

export const createInterviewSession = async ({ userId, role, mode }) => {
  const resume = await Resume.findOne({ user: userId });

  if (!resume) {
    throw new Error("Please upload your resume before starting interview");
  }

  const questions = [
    `Tell me about your strongest project related to ${role}.`,
    `What are the key skills required for a ${role} role?`,
    `Explain one technical challenge you faced in your project.`,
    `How would you improve one of your existing projects?`,
    `Explain your understanding of APIs.`,
    `What is authentication and why is it important?`,
    `How do you handle errors in an application?`,
    `Explain a database concept you have used.`,
    `How would you optimize a slow application?`,
    `Why should we consider you for a ${role} role?`,
  ];

  const session = await InterviewSession.create({
    user: userId,
    role,
    mode,
    questions,
  });

  return {
    message: "Interview session created successfully",
    sessionId: session._id,
    role: session.role,
    mode: session.mode,
    questions: session.questions,
  };
};

export const fetchInterviewSession = async ({ userId, sessionId }) => {
  const session = await InterviewSession.findOne({
    _id: sessionId,
    user: userId,
  });

  if (!session) {
    throw new Error("Interview session not found");
  }

  return {
    sessionId: session._id,
    role: session.role,
    mode: session.mode,
    questions: session.questions,
    answers: session.answers,
    currentQuestion: session.currentQuestion,
    status: session.status,
  };
};