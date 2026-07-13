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

      <button onClick={() => navigate("/resume")}>
        Upload Resume
      </button>

      <br />
      <br />

      <button onClick={() => navigate("/interview/setup")}>
        Start Mock Interview
      </button>

      <br />
      <br />

      <button onClick={() => navigate("/interview/history")}>
        Interview History
      </button>

      <br />
      <br />

      <button onClick={() => navigate("/dsa/setup")}>
        Start DSA Assessment
      </button>

      <br />
      <br />

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default DashboardPage;