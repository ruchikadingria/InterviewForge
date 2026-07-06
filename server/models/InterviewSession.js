import mongoose from "mongoose";

const interviewSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["Frontend", "Backend", "Fullstack", "DSA"],
      required: true,
    },

    mode: {
      type: String,
      enum: ["Text", "Voice"],
      required: true,
    },

    questions: {
      type: [String],
      required: true,
    },

    answers: {
      type: [String],
      default: [],
    },

    currentQuestion: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const InterviewSession = mongoose.model(
  "InterviewSession",
  interviewSessionSchema
);