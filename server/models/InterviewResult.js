import mongoose from "mongoose";

const interviewResultSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    role: {
        type: String,
        enum: ["Frontend", "Backend", "Fullstack", "DSA"],
        required: true
    },

    mode: {
        type: String,
        enum: ["Text", "Voice"],
        default: "Voice",
        required: true
    },

    score: {
        type: Number,
        required: true
    },

    questionsAnsweredWell: {
        type: Number,
        required: true
    },

    strengths: {
        type: [String],
        default: []
    },

    weaknesses: {
        type: [String],
        default: []

    },

    recommendations: {
        type: [String],
        default: []
    },
},
    {
        timestamps: true,
    }
)

export const InterviewResult = mongoose.model("InterviewResult", interviewResultSchema)