import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const InterviewHistoryPage = () => {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:8000/api/interview/history",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setHistory(response.data);
      } catch (error) {
        setMessage(error.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <p>Loading interview history...</p>;
  }

  if (message) {
    return <p>{message}</p>;
  }

  return (
    <div>
      <h1>Interview History</h1>

      <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>

      <br />
      <br />

      {history.length === 0 ? (
        <p>No interviews found. Start your first mock interview.</p>
      ) : (
        history.map((result) => (
          <div key={result._id}>
            <h2>{result.interviewSession?.role || "Interview"}</h2>

            <p>Mode: {result.interviewSession?.mode}</p>
            <p>Overall Score: {result.overallScore}/100</p>
            <p>Technical Score: {result.technicalScore}/100</p>
            <p>Communication Score: {result.communicationScore}/100</p>

            <p>
              Date:{" "}
              {new Date(result.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>

            <button onClick={() => navigate(`/interview/result/${result._id}`)}>
              View Report
            </button>

            <hr />
          </div>
        ))
      )}
    </div>
  );
};

export default InterviewHistoryPage;