import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DSASetupPage = () => {
  const navigate = useNavigate();

  const [language, setLanguage] = useState("cpp");
  const [message, setMessage] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  const handleStartAssessment = async () => {
    try {
      setIsStarting(true);
      setMessage("");

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:8000/api/dsa/start",
        {
          language,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      navigate(`/dsa/session/${response.data.sessionId}`);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to start DSA assessment"
      );
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div>
      <h1>DSA Assessment Setup</h1>

      <p>
        You will receive three coding problems: one Easy, one Medium, and one
        Hard.
      </p>

      <p>Total duration: 90 minutes</p>

      <label htmlFor="language">Select Programming Language</label>

      <br />
      <br />

      <select
        id="language"
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
      >
        <option value="cpp">C++</option>
        <option value="java">Java</option>
        <option value="python">Python</option>
      </select>

      <br />
      <br />

      <button
        onClick={handleStartAssessment}
        disabled={isStarting}
      >
        {isStarting ? "Starting Assessment..." : "Start Assessment"}
      </button>

      <br />
      <br />

      <button onClick={() => navigate("/dashboard")}>
        Back to Dashboard
      </button>

      {message && <p>{message}</p>}
    </div>
  );
};

export default DSASetupPage;