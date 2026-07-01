import mongoose from "mongoose"

const resumeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    originalFileName: {
        type: String,
        required: true,
    },

    resumeText: {
        type: String,
        required: true,
    },
},

    {
        timestamps: true,
    }
)

export const Resume = mongoose.model("Resume", resumeSchema);