import mongoose from "mongoose";

const questionEvaluationSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DSAQuestion",
      required: true,
    },

    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    correctness: {
      type: String,
      default: "",
    },

    approach: {
      type: String,
      default: "",
    },

    timeComplexity: {
      type: String,
      default: "",
    },

    spaceComplexity: {
      type: String,
      default: "",
    },

    codeQuality: {
      type: String,
      default: "",
    },

    edgeCases: {
      type: String,
      default: "",
    },

    feedback: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const dsaResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    dsaSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DSASession",
      required: true,
      unique: true,
    },

    language: {
      type: String,
      enum: ["cpp", "java", "python"],
      required: true,
    },

    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    questionEvaluations: {
      type: [questionEvaluationSchema],
      default: [],
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

dsaResultSchema.index({
  user: 1,
  createdAt: -1,
});

export const DSAResult = mongoose.model("DSAResult", dsaResultSchema);