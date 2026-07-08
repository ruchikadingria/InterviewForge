import { Resume } from "../models/Resume.js";
import { InterviewSession } from "../models/InterviewSession.js";
import { InterviewResult } from "../models/InterviewResult.js";
import {
  generateInterviewQuestions,
  evaluateInterviewAnswers,
} from "./aiService.js";

export const createInterviewSession = async ({ userId, role, mode }) => {
  const existingSession = await InterviewSession.findOne({
    user: userId,
    role,
    mode,
    status: "in-progress",
  });

  if (existingSession) {
    return {
      message: "Existing interview session found",
      sessionId: existingSession._id,
      role: existingSession.role,
      mode: existingSession.mode,
    };
  }

  const resume = await Resume.findOne({ user: userId });

  if (!resume) {
    throw new Error("Please upload your resume before starting interview");
  }

  const questions = await generateInterviewQuestions({
    resumeText: resume.resumeText,
    role,
  });

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

export const saveInterviewAnswer = async ({ userId, sessionId, answer }) => {
  const session = await InterviewSession.findOne({
    _id: sessionId,
    user: userId,
  });

  if (!session) {
    throw new Error("Interview session not found");
  }

  if (session.status === "completed") {
    throw new Error("Interview already completed");
  }

  if (!answer || answer.trim() === "") {
    throw new Error("Answer cannot be empty");
  }

  session.answers.push(answer);

  if (session.currentQuestion + 1 >= session.questions.length) {
    session.status = "completed";
    session.completedAt = new Date();
  } else {
    session.currentQuestion += 1;
  }

  await session.save();

  let interviewResult = null;

  if (session.status === "completed") {
    const resume = await Resume.findOne({
      user: userId,
    });

    console.log("Calling Gemini for evaluation...");

    const evaluation = await evaluateInterviewAnswers({
      resumeText: resume.resumeText,
      role: session.role,
      questions: session.questions,
      answers: session.answers,
    });

    console.log("Gemini evaluation completed");
    console.log("Saving InterviewResult...");

    interviewResult = await InterviewResult.create({
      user: userId,
      interviewSession: session._id,
      overallScore: evaluation.overallScore,
      technicalScore: evaluation.technicalScore,
      communicationScore: evaluation.communicationScore,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      suggestions: evaluation.suggestions,
      feedback: evaluation.feedback,
    });

    console.log("InterviewResult saved:", interviewResult._id);
  }

  return {
    message:
      session.status === "completed"
        ? "Interview completed"
        : "Answer saved successfully",
    currentQuestion: session.currentQuestion,
    status: session.status,
    resultId: interviewResult?._id,
  };
};

export const fetchInterviewResult = async ({ userId, resultId }) => {
  const result = await InterviewResult.findOne({
    _id: resultId,
    user: userId,
  });

  if (!result) {
    throw new Error("Interview result not found");
  }

  return result;
};