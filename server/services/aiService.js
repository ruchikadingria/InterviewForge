import { GoogleGenAI } from "@google/genai";

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const cleanAIResponse = (text = "") => {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
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

const getDSAEvaluationSchema = (solutionCount) => ({
  type: "object",
  additionalProperties: false,
  required: [
    "overallScore",
    "questionEvaluations",
    "strengths",
    "weaknesses",
    "suggestions",
    "feedback",
  ],
  properties: {
    overallScore: {
      type: "number",
      minimum: 0,
      maximum: 100,
    },
    questionEvaluations: {
      type: "array",
      minItems: solutionCount,
      maxItems: solutionCount,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "score",
          "correctness",
          "approach",
          "timeComplexity",
          "spaceComplexity",
          "codeQuality",
          "edgeCases",
          "feedback",
        ],
        properties: {
          score: {
            type: "number",
            minimum: 0,
            maximum: 100,
          },
          correctness: { type: "string" },
          approach: { type: "string" },
          timeComplexity: { type: "string" },
          spaceComplexity: { type: "string" },
          codeQuality: { type: "string" },
          edgeCases: { type: "string" },
          feedback: { type: "string" },
        },
      },
    },
    strengths: {
      type: "array",
      items: { type: "string" },
    },
    weaknesses: {
      type: "array",
      items: { type: "string" },
    },
    suggestions: {
      type: "array",
      items: { type: "string" },
    },
    feedback: { type: "string" },
  },
});

const generateDSAEvaluationWithRetry = async ({
  ai,
  prompt,
  solutionCount,
  retries = 3,
}) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseJsonSchema: getDSAEvaluationSchema(solutionCount),
          maxOutputTokens: 8192,
        },
      });

      const evaluation = JSON.parse(cleanAIResponse(response.text));

      if (
        !Array.isArray(evaluation.questionEvaluations) ||
        evaluation.questionEvaluations.length !== solutionCount
      ) {
        throw new Error("Invalid number of question evaluations");
      }

      return evaluation;
    } catch (error) {
      console.log(`Gemini DSA Evaluation Attempt ${attempt} Failed`);

      if (attempt === retries) {
        throw new Error(
          "Unable to evaluate the assessment right now. Please submit again."
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

  const text = cleanAIResponse(response.text);

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

  const text = cleanAIResponse(response.text);

  return JSON.parse(text);
};

export const evaluateDSASolutions = async ({ language, solutions }) => {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const prompt = `
You are an expert Data Structures and Algorithms interviewer and code reviewer.

Evaluate the candidate's complete DSA assessment.

Programming Language:
${language}

Questions and Submitted Solutions:
${JSON.stringify(solutions, null, 2)}

Evaluate every submitted solution based on:

- Logical correctness
- Suitability of the chosen approach
- Time complexity
- Space complexity
- Code readability and quality
- Handling of edge cases
- Whether the solution appears complete
- Whether the code is likely to compile

Important:
- The code is not being executed against actual test cases.
- Do not claim that test cases passed.
- Base correctness only on static code analysis.
- Evaluate the questions in the same order in which they are provided.
- Return exactly one question evaluation for every submitted solution.

Return ONLY valid JSON in this exact format:

{
  "overallScore": 0,
  "questionEvaluations": [
    {
      "score": 0,
      "correctness": "",
      "approach": "",
      "timeComplexity": "",
      "spaceComplexity": "",
      "codeQuality": "",
      "edgeCases": "",
      "feedback": ""
    }
  ],
  "strengths": [],
  "weaknesses": [],
  "suggestions": [],
  "feedback": ""
}

Rules:
- overallScore must be a number from 0 to 100.
- Each question score must be a number from 0 to 100.
- questionEvaluations must contain exactly ${solutions.length} objects.
- Keep question evaluations in the same order as the supplied solutions.
- correctness must explain whether the code logic appears correct.
- approach must explain the algorithm used by the candidate.
- timeComplexity must contain the expected time complexity.
- spaceComplexity must contain the expected auxiliary space complexity.
- codeQuality must briefly evaluate readability and structure.
- edgeCases must explain whether important edge cases were handled.
- feedback must contain concise and actionable comments.
- strengths must be an array of strings.
- weaknesses must be an array of strings.
- suggestions must be an array of strings.
- Do not include markdown.
- Do not use code fences.
- Do not include explanations outside the JSON object.
`;

  const evaluation = await generateDSAEvaluationWithRetry({
    ai,
    prompt,
    solutionCount: solutions.length,
  });

  return evaluation;
};
