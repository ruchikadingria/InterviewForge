import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const InterviewResultPage = () => {
  const { resultId } = useParams();

  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:8000/api/interview/result/${resultId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setResult(response.data);
      } catch (error) {
        setMessage(error.response?.data?.message || "Something went wrong");
      }
    };

    fetchResult();
  }, [resultId]);

  if (message) {
    return <p>{message}</p>;
  }

  if (!result) {
    return <p>Loading interview result...</p>;
  }

  return (
    <div>
      <h1>Interview Result</h1>

      <h2>Overall Score: {result.overallScore}/100</h2>
      <p>Technical Score: {result.technicalScore}/100</p>
      <p>Communication Score: {result.communicationScore}/100</p>

      <h3>Strengths</h3>
      <ul>
        {result.strengths.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <h3>Weaknesses</h3>
      <ul>
        {result.weaknesses.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <h3>Suggestions</h3>
      <ul>
        {result.suggestions.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      <h3>Feedback</h3>
      <p>{result.feedback}</p>
    </div>
  );
};

export default InterviewResultPage;