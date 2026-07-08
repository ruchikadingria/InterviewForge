import mongoose from "mongoose";

const interviewResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    interviewSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewSession",
      required: true,
    },

    overallScore: {
      type: Number,
      required: true,
    },

    technicalScore: {
      type: Number,
      required: true,
    },

    communicationScore: {
      type: Number,
      required: true,
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    suggestions: {
      type: [String],
      default: [],
    },

    feedback: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const InterviewResult = mongoose.model(
  "InterviewResult",
  interviewResultSchema
);