import pdfParse from "pdf-parse-new";
import { Resume } from "../models/Resume.js";

export const saveResume = async ({ userId, file }) => {
  if (file.mimetype !== "application/pdf") {
    throw new Error("Only PDF files are allowed");
  }

  const pdfData = await pdfParse(file.buffer);

  if (!pdfData.text || pdfData.text.trim().length === 0) {
    throw new Error("Could not extract text from PDF");
  }

  const resume = await Resume.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      originalFileName: file.originalname,
      resumeText: pdfData.text,
    },
    {
      returnDocument: "after",
      upsert: true,
    }
  );

  return {
    message: "Resume uploaded successfully",
    resume: {
      id: resume._id,
      originalFileName: resume.originalFileName,
      uploadedAt: resume.updatedAt,
    },
  };
};