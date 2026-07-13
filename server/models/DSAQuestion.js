import mongoose from "mongoose";

const dsaQuestionSchema = new mongoose.Schema(
  {
    leetcodeId: {
      type: Number,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    titleSlug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    problemStatement: {
      type: String,
      required: true,
    },

    examples: {
      type: [String],
      default: [],
    },

    constraints: {
      type: [String],
      default: [],
    },

    hints: {
      type: [String],
      default: [],
    },

    starterCode: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    source: {
      type: String,
      default: "HuggingFace LeetCodeDataset",
    },
  },
  {
    timestamps: true,
  }
);

export const DSAQuestion = mongoose.model("DSAQuestion", dsaQuestionSchema);