import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const InterviewSessionPage = () => {
  const { sessionId } = useParams();

  const [session, setSession] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:8000/api/interview/${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSession(response.data);
      } catch (error) {
        setMessage(error.response?.data?.message || "Something went wrong");
      }
    };

    fetchSession();
  }, [sessionId]);

  if (message) {
    return <p>{message}</p>;
  }

  if (!session) {
    return <p>Loading interview session...</p>;
  }

  return (
    <div>
      <h1>Interview Session</h1>

      <p>Session ID: {session.sessionId}</p>
      <p>Role: {session.role}</p>
      <p>Mode: {session.mode}</p>

      <h2>Questions</h2>

      {session.questions.map((question, index) => (
        <p key={index}>
          {index + 1}. {question}
        </p>
      ))}
    </div>
  );
};

export default InterviewSessionPage;