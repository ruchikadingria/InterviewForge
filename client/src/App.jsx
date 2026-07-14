import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ResumePage from "./pages/ResumePage";
import ProtectedRoute from "./components/ProtectedRoute";
import InterviewSetupPage from "./pages/InterviewSetupPage";
import InterviewSessionPage from "./pages/InterviewSessionPage";
import InterviewResultPage from "./pages/InterviewResultPage";
import InterviewHistoryPage from "./pages/InterviewHistoryPage";
import DSASetupPage from "./pages/DSASetupPage";
import DSASessionPage from "./pages/DSASessionPage";


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/resume"
          element={
            <ProtectedRoute>
              <ResumePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/setup"
          element={
            <ProtectedRoute>
              <InterviewSetupPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/session/:sessionId"
          element={
            <ProtectedRoute>
              <InterviewSessionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/result/:resultId"
          element={
            <ProtectedRoute>
              <InterviewResultPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/history"
          element={
            <ProtectedRoute>
              <InterviewHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dsa/setup"
          element={
            <ProtectedRoute>
              <DSASetupPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dsa/session/:sessionId"
          element={
            <ProtectedRoute>
              <DSASessionPage />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;