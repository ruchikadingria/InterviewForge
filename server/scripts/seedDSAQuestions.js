import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { DSAQuestion } from "../models/DSAQuestion.js";

dotenv.config();

const filePath = path.join(process.cwd(), "dataset", "leetcode_questions.json");

const createSlug = (title = "") => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const normalizeDifficulty = (difficulty = "") => {
  const value = difficulty.toString().toLowerCase();

  if (value.includes("easy")) return "Easy";
  if (value.includes("medium")) return "Medium";
  if (value.includes("hard")) return "Hard";

  return "Medium";
};

const normalizeArray = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const seedDSAQuestions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const rawData = fs.readFileSync(filePath, "utf-8");
    const questions = JSON.parse(rawData);

    console.log(`Total questions found: ${questions.length}`);

    let insertedCount = 0;
    let skippedCount = 0;

    for (const question of questions) {
      const title =
        question.title ||
        question.question_title ||
        question.task_id ||
        "Untitled Problem";

      const titleSlug =
        question.titleSlug ||
        question.title_slug ||
        createSlug(title);

      const existingQuestion = await DSAQuestion.findOne({ titleSlug });

      if (existingQuestion) {
        skippedCount++;
        continue;
      }

      await DSAQuestion.create({
        leetcodeId:
          Number(question.question_id) ||
          Number(question.frontend_question_id) ||
          insertedCount + 1,

        title,
        titleSlug,

        difficulty: normalizeDifficulty(question.difficulty),

        tags: normalizeArray(question.tags || question.topic_tags),

        problemStatement:
          question.problem_description ||
          question.content ||
          question.description ||
          "No problem statement available.",

        examples: normalizeArray(question.examples),

        constraints: normalizeArray(question.constraints),

        hints: normalizeArray(question.hints),

        starterCode: question.starter_code || {},

        source: "HuggingFace LeetCodeDataset",
      });

      insertedCount++;
    }

    console.log("DSA questions seeded successfully");
    console.log(`Inserted: ${insertedCount}`);
    console.log(`Skipped: ${skippedCount}`);

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
};

seedDSAQuestions();