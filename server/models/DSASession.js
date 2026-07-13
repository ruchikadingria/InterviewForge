import mongoose from "mongoose";

const solutionSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DSAQuestion",
      required: true,
    },

    code: {
      type: String,
      default: "",
    },

    language: {
      type: String,
      enum: ["cpp", "java", "python"],
      required: true,
    },

    submittedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const dsaSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    language: {
      type: String,
      enum: ["cpp", "java", "python"],
      required: true,
    },

    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DSAQuestion",
        required: true,
      },
    ],

    solutions: {
      type: [solutionSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["in-progress", "completed", "expired"],
      default: "in-progress",
    },

    durationMinutes: {
      type: Number,
      default: 90,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

dsaSessionSchema.index({
  user: 1,
  status: 1,
});

export const DSASession = mongoose.model("DSASession", dsaSessionSchema);