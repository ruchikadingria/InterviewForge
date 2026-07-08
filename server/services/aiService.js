import { GoogleGenAI } from "@google/genai";

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const generateWithRetry = async ({ ai, prompt, retries = 3 }) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response;
    } catch (error) {
      console.log(`Gemini Attempt ${attempt} Failed`);

      if (attempt === retries) {
        throw new Error(
          "AI service is currently busy. Please try again in a few moments."
        );
      }

      await sleep(2000);
    }
  }
};

export const generateInterviewQuestions = async ({ resumeText, role }) => {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const prompt = `
You are an expert technical interviewer.

Generate exactly 10 mock interview questions for a candidate.

Role: ${role}

Resume:
${resumeText}

Question distribution:
- 4 questions based on the resume.
- 4 questions based on the selected role.
- 2 hybrid questions connecting the resume with the role.

Rules:
- Return ONLY a valid JSON array of strings.
- Do not return markdown.
- Do not use \`\`\`json.
- Do not number the questions.
- Do not include explanations.
`;

  const response = await generateWithRetry({
    ai,
    prompt,
  });

  let text = response.text;

  text = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(text);
};

export const evaluateInterviewAnswers = async ({
  resumeText,
  role,
  questions,
  answers,
}) => {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const questionAnswerPairs = questions.map((question, index) => ({
    question,
    answer: answers[index] || "",
  }));

  const prompt = `
You are an expert technical interviewer.

Evaluate this mock interview.

Role:
${role}

Candidate Resume:
${resumeText}

Interview Questions and Answers:
${JSON.stringify(questionAnswerPairs, null, 2)}

Return ONLY valid JSON in this exact format:

{
  "overallScore": 0,
  "technicalScore": 0,
  "communicationScore": 0,
  "strengths": [],
  "weaknesses": [],
  "suggestions": [],
  "feedback": ""
}

Rules:
- Scores must be numbers from 0 to 100.
- strengths must be an array of strings.
- weaknesses must be an array of strings.
- suggestions must be an array of strings.
- feedback must be a short paragraph.
- Do not include markdown.
- Do not include explanations outside JSON.
`;

  const response = await generateWithRetry({
    ai,
    prompt,
  });

  let text = response.text;

  text = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(text);
};