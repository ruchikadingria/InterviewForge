import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const InterviewSessionPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      setMessage("Please enter your answer before continuing.");
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage("");

      const token = localStorage.getItem("token");

      const response = await axios.post(
        `http://localhost:8000/api/interview/${sessionId}/answer`,
        { answer },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "completed" && response.data.resultId) {
        navigate(`/interview/result/${response.data.resultId}`);
        return;
      }

      setSession((prev) => ({
        ...prev,
        currentQuestion: response.data.currentQuestion,
        status: response.data.status,
      }));

      setAnswer("");
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (message && !session) {
    return <p>{message}</p>;
  }

  if (!session) {
    return <p>Loading interview session...</p>;
  }

  const currentQuestionText = session.questions[session.currentQuestion];

  return (
    <div>
      <h1>Interview Session</h1>

      <p>Role: {session.role}</p>
      <p>Mode: {session.mode}</p>

      <h2>
        Question {session.currentQuestion + 1} of {session.questions.length}
      </h2>

      <p>{currentQuestionText}</p>

      <textarea
        rows="6"
        cols="60"
        placeholder="Type your answer here..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleSubmitAnswer} disabled={isSubmitting}>
        {isSubmitting
          ? "Submitting..."
          : session.currentQuestion + 1 === session.questions.length
          ? "Finish Interview"
          : "Save & Next"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
};

export default InterviewSessionPage;