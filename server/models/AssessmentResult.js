import mongoose from "mongoose";

const assessmentResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    score: {
      type: Number,
      required: true,
    },

    solvedCount: {
      type: Number,
      required: true,
    },

    timeTaken: {
      type: Number,
      required: true,
    },

    problemOutcomes: [
      {
        difficulty: {
          type: String,
          enum: ["Easy", "Medium", "Hard"],
          required: true,
        },

        solved: {
          type: Boolean,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const AssessmentResult = mongoose.model(
  "AssessmentResult",
  assessmentResultSchema
);