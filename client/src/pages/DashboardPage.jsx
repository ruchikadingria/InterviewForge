import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div>
      <h1>Welcome to InterviewForge</h1>

      <button onClick={() => navigate("/resume")}>Upload Resume</button>
      <button onClick={() => navigate("/interview/setup")}>
        Start Mock Interview
      </button>
      <button>Start DSA Assessment</button>

      <br />
      <br />

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default DashboardPage;