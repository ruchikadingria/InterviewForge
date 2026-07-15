import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LANGUAGE_LABELS = {
  cpp: "C++",
  java: "Java",
  python: "Python",
};

const DSAHistoryPage = () => {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setMessage("");

        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:8000/api/dsa/history",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setHistory(response.data);
      } catch (error) {
        setMessage(
          error.response?.data?.message ||
            "Unable to load DSA assessment history"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <p>Loading DSA assessment history...</p>;
  }

  if (message) {
    return <p>{message}</p>;
  }

  return (
    <div>
      <h1>DSA Assessment History</h1>

      <button onClick={() => navigate("/dashboard")}>
        Back to Dashboard
      </button>

      <br />
      <br />

      {history.length === 0 ? (
        <div>
          <p>No completed DSA assessments found.</p>

          <button onClick={() => navigate("/dsa/setup")}>
            Start Your First Assessment
          </button>
        </div>
      ) : (
        history.map((result, index) => (
          <article key={result._id}>
            <h2>Assessment #{history.length - index}</h2>

            <p>
              Language:{" "}
              <strong>
                {LANGUAGE_LABELS[result.language] || result.language}
              </strong>
            </p>

            <p>
              Overall Score:{" "}
              <strong>{result.overallScore}/100</strong>
            </p>

            <p>
              Status:{" "}
              <strong>
                {result.dsaSession?.status || "completed"}
              </strong>
            </p>

            <p>
              Duration:{" "}
              <strong>
                {result.dsaSession?.durationMinutes || 90} minutes
              </strong>
            </p>

            <p>
              Completed On:{" "}
              <strong>
                {new Date(
                  result.dsaSession?.completedAt || result.createdAt
                ).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </strong>
            </p>

            <button
              onClick={() =>
                navigate(`/dsa/result/${result._id}`)
              }
            >
              View Report
            </button>

            <hr />
          </article>
        ))
      )}
    </div>
  );
};

export default DSAHistoryPage;