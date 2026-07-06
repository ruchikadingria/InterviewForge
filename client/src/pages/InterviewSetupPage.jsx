import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const InterviewSetupPage = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [mode, setMode] = useState("");
  const [message, setMessage] = useState("");

  const handleStartInterview = async () => {
    try {
      if (!role || !mode) {
        setMessage("Please select role and mode");
        return;
      }

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:8000/api/interview/start",
        { role, mode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate(`/interview/session/${response.data.sessionId}`);
      
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div>
      <h1>Start Mock Interview</h1>

      <label>Select Role</label>
      <br />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="">Choose Role</option>
        <option value="Frontend">Frontend</option>
        <option value="Backend">Backend</option>
        <option value="Fullstack">Fullstack</option>
        <option value="DSA">DSA</option>
      </select>

      <br />
      <br />

      <label>Select Mode</label>
      <br />
      <select value={mode} onChange={(e) => setMode(e.target.value)}>
        <option value="">Choose Mode</option>
        <option value="Text">Text</option>
        <option value="Voice">Voice</option>
      </select>

      <br />
      <br />

      <button onClick={handleStartInterview}>Start Interview</button>

      {message && <p>{message}</p>}
    </div>
  );
};

export default InterviewSetupPage;