import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const DSAResultPage = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        setMessage("");

        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:8000/api/dsa/result/${resultId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setResult(response.data);
      } catch (error) {
        setMessage(
          error.response?.data?.message || "Unable to load DSA result"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultId]);

  if (loading) {
    return <p>Loading DSA assessment result...</p>;
  }

  if (message) {
    return <p>{message}</p>;
  }

  if (!result) {
    return <p>DSA result not found.</p>;
  }

  return (
    <div>
      <header>
        <h1>DSA Assessment Report</h1>

        <p>
          Language: <strong>{result.language}</strong>
        </p>

        <h2>Overall Score: {result.overallScore}/100</h2>
      </header>

      <hr />

      <section>
        <h2>Question-wise Evaluation</h2>

        {result.questionEvaluations?.map((evaluation, index) => (
          <article key={evaluation.question?._id || index}>
            <h3>
              Question {index + 1}:{" "}
              {evaluation.question?.title || "DSA Question"}
            </h3>

            <p>
              Difficulty:{" "}
              <strong>
                {evaluation.question?.difficulty || "Not available"}
              </strong>
            </p>

            <p>
              Score: <strong>{evaluation.score}/100</strong>
            </p>

            <h4>Correctness</h4>
            <p>{evaluation.correctness || "No correctness review available."}</p>

            <h4>Approach</h4>
            <p>{evaluation.approach || "No approach review available."}</p>

            <h4>Time Complexity</h4>
            <p>
              {evaluation.timeComplexity ||
                "No time-complexity analysis available."}
            </p>

            <h4>Space Complexity</h4>
            <p>
              {evaluation.spaceComplexity ||
                "No space-complexity analysis available."}
            </p>

            <h4>Code Quality</h4>
            <p>{evaluation.codeQuality || "No code-quality review available."}</p>

            <h4>Edge Cases</h4>
            <p>{evaluation.edgeCases || "No edge-case review available."}</p>

            <h4>Feedback</h4>
            <p>{evaluation.feedback || "No feedback available."}</p>

            <hr />
          </article>
        ))}
      </section>

      <section>
        <h2>Strengths</h2>

        {result.strengths?.length > 0 ? (
          <ul>
            {result.strengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        ) : (
          <p>No strengths were provided.</p>
        )}
      </section>

      <section>
        <h2>Weaknesses</h2>

        {result.weaknesses?.length > 0 ? (
          <ul>
            {result.weaknesses.map((weakness, index) => (
              <li key={index}>{weakness}</li>
            ))}
          </ul>
        ) : (
          <p>No weaknesses were provided.</p>
        )}
      </section>

      <section>
        <h2>Suggestions</h2>

        {result.suggestions?.length > 0 ? (
          <ul>
            {result.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        ) : (
          <p>No suggestions were provided.</p>
        )}
      </section>

      <section>
        <h2>Overall Interviewer Feedback</h2>
        <p>{result.feedback}</p>
      </section>

      <hr />

      <button onClick={() => navigate("/dashboard")}>
        Back to Dashboard
      </button>

      <button onClick={() => navigate("/dsa/history")}>
        View DSA History
      </button>
    </div>
  );
};

export default DSAResultPage;