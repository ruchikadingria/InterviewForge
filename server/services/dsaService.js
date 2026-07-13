import { DSAQuestion } from "../models/DSAQuestion.js";
import { DSASession } from "../models/DSASession.js";
import { DSAResult } from "../models/DSAResult.js";
import { evaluateDSASolutions } from "./aiService.js";

const getRandomQuestionByDifficulty = async (difficulty) => {
  const questions = await DSAQuestion.aggregate([
    {
      $match: {
        difficulty,
      },
    },
    {
      $sample: {
        size: 1,
      },
    },
  ]);

  if (questions.length === 0) {
    throw new Error(`${difficulty} DSA question not found`);
  }

  return questions[0];
};

export const createDSASession = async ({ userId, language }) => {
  const supportedLanguages = ["cpp", "java", "python"];

  if (!language || !supportedLanguages.includes(language)) {
    throw new Error("Please select a valid programming language");
  }

  const existingSession = await DSASession.findOne({
    user: userId,
    status: "in-progress",
  });

  if (existingSession) {
    return {
      message: "Existing DSA assessment session found",
      sessionId: existingSession._id,
      language: existingSession.language,
      status: existingSession.status,
    };
  }

  const easyQuestion = await getRandomQuestionByDifficulty("Easy");
  const mediumQuestion = await getRandomQuestionByDifficulty("Medium");
  const hardQuestion = await getRandomQuestionByDifficulty("Hard");

  const selectedQuestions = [
    easyQuestion._id,
    mediumQuestion._id,
    hardQuestion._id,
  ];

  const solutions = selectedQuestions.map((questionId) => ({
    question: questionId,
    language,
    code: "",
  }));

  const session = await DSASession.create({
    user: userId,
    language,
    questions: selectedQuestions,
    solutions,
    status: "in-progress",
    durationMinutes: 90,
    startedAt: new Date(),
  });

  return {
    message: "DSA assessment started successfully",
    sessionId: session._id,
    language: session.language,
    status: session.status,
    durationMinutes: session.durationMinutes,
    startedAt: session.startedAt,
  };
};

export const fetchDSASession = async ({ userId, sessionId }) => {
  const session = await DSASession.findOne({
    _id: sessionId,
    user: userId,
  })
    .populate(
      "questions",
      "leetcodeId title titleSlug difficulty tags problemStatement examples constraints hints starterCode"
    )
    .populate(
      "solutions.question",
      "leetcodeId title titleSlug difficulty"
    );

  if (!session) {
    throw new Error("DSA assessment session not found");
  }

  const expiryTime =
    new Date(session.startedAt).getTime() +
    session.durationMinutes * 60 * 1000;

  const remainingMilliseconds = expiryTime - Date.now();

  if (remainingMilliseconds <= 0 && session.status === "in-progress") {
    session.status = "expired";
    session.completedAt = new Date();

    await session.save();
  }

  return {
    sessionId: session._id,
    language: session.language,
    questions: session.questions,
    solutions: session.solutions,
    status: session.status,
    durationMinutes: session.durationMinutes,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    remainingSeconds:
      session.status === "in-progress"
        ? Math.max(0, Math.floor(remainingMilliseconds / 1000))
        : 0,
  };
};

export const saveDSASolution = async ({
  userId,
  sessionId,
  questionId,
  code,
}) => {
  if (!questionId) {
    throw new Error("Question ID is required");
  }

  if (typeof code !== "string") {
    throw new Error("Code must be a valid string");
  }

  const session = await DSASession.findOne({
    _id: sessionId,
    user: userId,
  });

  if (!session) {
    throw new Error("DSA assessment session not found");
  }

  if (session.status !== "in-progress") {
    throw new Error("This DSA assessment is no longer active");
  }

  const expiryTime =
    new Date(session.startedAt).getTime() +
    session.durationMinutes * 60 * 1000;

  if (Date.now() >= expiryTime) {
    session.status = "expired";
    session.completedAt = new Date();

    await session.save();

    throw new Error("DSA assessment time has expired");
  }

  const questionAssigned = session.questions.some(
    (question) => question.toString() === questionId.toString()
  );

  if (!questionAssigned) {
    throw new Error("This question does not belong to the assessment");
  }

  const solution = session.solutions.find(
    (item) => item.question.toString() === questionId.toString()
  );

  if (!solution) {
    throw new Error("Solution entry not found");
  }

  solution.code = code;
  solution.submittedAt = new Date();

  await session.save();

  return {
    message: "Code saved successfully",
    questionId,
    savedAt: solution.submittedAt,
  };
};

export const submitDSAAssessment = async ({ userId, sessionId }) => {
  const session = await DSASession.findOne({
    _id: sessionId,
    user: userId,
  }).populate(
    "questions",
    "title difficulty problemStatement examples constraints"
  );

  if (!session) {
    throw new Error("DSA assessment session not found");
  }

  const existingResult = await DSAResult.findOne({
    dsaSession: session._id,
    user: userId,
  });

  if (existingResult) {
    return {
      message: "DSA assessment already evaluated",
      resultId: existingResult._id,
      status: session.status,
    };
  }

  if (session.status !== "in-progress") {
    throw new Error("This DSA assessment is no longer active");
  }

  const expiryTime =
    new Date(session.startedAt).getTime() +
    session.durationMinutes * 60 * 1000;

  if (Date.now() >= expiryTime) {
    session.status = "expired";
    session.completedAt = new Date();

    await session.save();

    throw new Error("DSA assessment time has expired");
  }

  const unansweredSolutions = session.solutions.filter(
    (solution) => !solution.code || solution.code.trim() === ""
  );

  if (unansweredSolutions.length > 0) {
    throw new Error(
      "Please write code for all three questions before submitting"
    );
  }

  const evaluationInput = session.questions.map((question) => {
    const solution = session.solutions.find(
      (item) => item.question.toString() === question._id.toString()
    );

    return {
      questionId: question._id,
      title: question.title,
      difficulty: question.difficulty,
      problemStatement: question.problemStatement,
      examples: question.examples,
      constraints: question.constraints,
      code: solution?.code || "",
    };
  });

  console.log("Calling Gemini for DSA evaluation...");

  const evaluation = await evaluateDSASolutions({
    language: session.language,
    solutions: evaluationInput,
  });

  console.log("Gemini DSA evaluation completed");

  const questionEvaluations = evaluation.questionEvaluations.map(
    (item, index) => ({
      question: session.questions[index]._id,
      score: item.score,
      correctness: item.correctness,
      approach: item.approach,
      timeComplexity: item.timeComplexity,
      spaceComplexity: item.spaceComplexity,
      codeQuality: item.codeQuality,
      edgeCases: item.edgeCases,
      feedback: item.feedback,
    })
  );

  const result = await DSAResult.create({
    user: userId,
    dsaSession: session._id,
    language: session.language,
    overallScore: evaluation.overallScore,
    questionEvaluations,
    strengths: evaluation.strengths,
    weaknesses: evaluation.weaknesses,
    suggestions: evaluation.suggestions,
    feedback: evaluation.feedback,
  });

  session.status = "completed";
  session.completedAt = new Date();

  await session.save();

  return {
    message: "DSA assessment submitted and evaluated successfully",
    status: session.status,
    resultId: result._id,
  };
};

export const fetchDSAResult = async ({ userId, resultId }) => {
  const result = await DSAResult.findOne({
    _id: resultId,
    user: userId,
  })
    .populate(
      "dsaSession",
      "language status startedAt completedAt durationMinutes"
    )
    .populate(
      "questionEvaluations.question",
      "leetcodeId title titleSlug difficulty tags problemStatement"
    );

  if (!result) {
    throw new Error("DSA result not found");
  }

  return result;
};

export const fetchDSAHistory = async ({ userId }) => {
  const results = await DSAResult.find({
    user: userId,
  })
    .sort({ createdAt: -1 })
    .select(
      "overallScore language strengths weaknesses suggestions feedback createdAt dsaSession"
    )
    .populate(
      "dsaSession",
      "status startedAt completedAt durationMinutes"
    );

  return results;
};