import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import axios from "axios";

const LANGUAGE_CONFIG = {
  cpp: {
    monacoLanguage: "cpp",
    label: "C++",
    defaultCode: `#include <bits/stdc++.h>
using namespace std;

int main() {
    
    return 0;
}`,
  },

  java: {
    monacoLanguage: "java",
    label: "Java",
    defaultCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        
    }
}`,
  },

  python: {
    monacoLanguage: "python",
    label: "Python",
    defaultCode: `def solve():
    pass


if __name__ == "__main__":
    solve()
`,
  },
};

const formatTime = (totalSeconds) => {
  const safeSeconds = Math.max(0, totalSeconds);

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};

const formatMemory = (memoryInBytes) => {
  if (memoryInBytes === null || memoryInBytes === undefined) {
    return "N/A";
  }

  const memoryInMB = memoryInBytes / (1024 * 1024);

  return `${memoryInMB.toFixed(2)} MB`;
};

const DSASessionPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const [codes, setCodes] = useState({});
  const [stdinByQuestion, setStdinByQuestion] = useState({});
  const [executionByQuestion, setExecutionByQuestion] = useState({});

  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const [loading, setLoading] = useState(true);
  const [savingQuestionId, setSavingQuestionId] = useState(null);
  const [runningQuestionId, setRunningQuestionId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        setMessage("");

        const response = await axios.get(
          `http://localhost:8000/api/dsa/${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const sessionData = response.data;

        const languageConfig =
          LANGUAGE_CONFIG[sessionData.language] || LANGUAGE_CONFIG.cpp;

        const initialCodes = {};

        sessionData.questions.forEach((question) => {
          const savedSolution = sessionData.solutions.find(
            (solution) =>
              solution.question?._id === question._id ||
              solution.question === question._id
          );

          initialCodes[question._id] =
            savedSolution?.code || languageConfig.defaultCode;
        });

        setSession(sessionData);
        setCodes(initialCodes);
        setRemainingSeconds(sessionData.remainingSeconds || 0);
      } catch (error) {
        setMessage(
          error.response?.data?.message || "Unable to load DSA assessment"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, token]);

  useEffect(() => {
    if (!session || session.status !== "in-progress") {
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((previousSeconds) => {
        if (previousSeconds <= 1) {
          clearInterval(timer);
          setMessage("Assessment time has expired.");
          return 0;
        }

        return previousSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session]);

  const activeQuestion = useMemo(() => {
    return session?.questions?.[activeQuestionIndex] || null;
  }, [session, activeQuestionIndex]);

  const activeExecution = useMemo(() => {
    if (!activeQuestion) {
      return null;
    }

    return executionByQuestion[activeQuestion._id] || null;
  }, [activeQuestion, executionByQuestion]);

  const handleCodeChange = (value) => {
    if (!activeQuestion) return;

    setCodes((previousCodes) => ({
      ...previousCodes,
      [activeQuestion._id]: value || "",
    }));
  };

  const handleInputChange = (event) => {
    if (!activeQuestion) return;

    setStdinByQuestion((previousInputs) => ({
      ...previousInputs,
      [activeQuestion._id]: event.target.value,
    }));
  };

  const handleSaveCode = async (questionId = activeQuestion?._id) => {
    if (!questionId) return;

    try {
      setSavingQuestionId(questionId);
      setMessage("");

      const response = await axios.post(
        `http://localhost:8000/api/dsa/${sessionId}/save`,
        {
          questionId,
          code: codes[questionId] || "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to save code");
    } finally {
      setSavingQuestionId(null);
    }
  };

  const handleRunCode = async () => {
    if (!activeQuestion) return;

    const questionId = activeQuestion._id;
    const code = codes[questionId] || "";
    const stdin = stdinByQuestion[questionId] || "";

    if (!code.trim()) {
      setMessage("Please write code before running it.");
      return;
    }

    try {
      setRunningQuestionId(questionId);
      setMessage("");

      setExecutionByQuestion((previousExecutions) => ({
        ...previousExecutions,
        [questionId]: null,
      }));

      const response = await axios.post(
        `http://localhost:8000/api/dsa/${sessionId}/run`,
        {
          questionId,
          code,
          stdin,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setExecutionByQuestion((previousExecutions) => ({
        ...previousExecutions,
        [questionId]: response.data,
      }));
    } catch (error) {
      setExecutionByQuestion((previousExecutions) => ({
        ...previousExecutions,
        [questionId]: {
          error:
            error.response?.data?.message ||
            "Unable to execute code",
        },
      }));
    } finally {
      setRunningQuestionId(null);
    }
  };

  const handleQuestionChange = async (nextIndex) => {
    if (nextIndex === activeQuestionIndex) {
      return;
    }

    if (activeQuestion) {
      await handleSaveCode(activeQuestion._id);
    }

    setActiveQuestionIndex(nextIndex);
    setMessage("");
  };

  const handleSubmitAssessment = async () => {
    const hasEmptySolution = session.questions.some((question) => {
      const code = codes[question._id] || "";
      return code.trim() === "";
    });

    if (hasEmptySolution) {
      setMessage(
        "Please write code for all three questions before submitting."
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to submit the complete assessment?"
    );

    if (!confirmed) return;

    try {
      setIsSubmitting(true);
      setMessage("");

      for (const question of session.questions) {
        await axios.post(
          `http://localhost:8000/api/dsa/${sessionId}/save`,
          {
            questionId: question._id,
            code: codes[question._id] || "",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const response = await axios.post(
        `http://localhost:8000/api/dsa/${sessionId}/submit`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.resultId) {
        navigate(`/dsa/result/${response.data.resultId}`);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to submit assessment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getConsoleOutput = () => {
    if (!activeQuestion) {
      return "No question selected.";
    }

    if (runningQuestionId === activeQuestion._id) {
      return "Compiling and running code...";
    }

    if (!activeExecution) {
      return "Run your code to see output.";
    }

    if (activeExecution.error) {
      return `Execution Error:\n${activeExecution.error}`;
    }

    if (activeExecution.compile?.stderr) {
      return `Compilation Error:\n${activeExecution.compile.stderr}`;
    }

    if (
      activeExecution.compile?.message &&
      activeExecution.compile?.code !== 0
    ) {
      return `Compilation Error:\n${activeExecution.compile.message}`;
    }

    if (
      activeExecution.compile?.output &&
      activeExecution.compile?.code !== 0
    ) {
      return `Compilation Output:\n${activeExecution.compile.output}`;
    }

    if (activeExecution.run?.stderr) {
      return `Runtime Error:\n${activeExecution.run.stderr}`;
    }

    if (
      activeExecution.run?.message &&
      activeExecution.run?.code !== 0
    ) {
      return `Runtime Error:\n${activeExecution.run.message}`;
    }

    if (activeExecution.run?.stdout) {
      return activeExecution.run.stdout;
    }

    if (activeExecution.run?.output) {
      return activeExecution.run.output;
    }

    if (activeExecution.run?.code === 0) {
      return "Program completed successfully with no output.";
    }

    return "No output received.";
  };

  if (loading) {
    return <p>Loading DSA assessment...</p>;
  }

  if (message && !session) {
    return <p>{message}</p>;
  }

  if (!session || !activeQuestion) {
    return <p>Assessment session not found.</p>;
  }

  const languageConfig =
    LANGUAGE_CONFIG[session.language] || LANGUAGE_CONFIG.cpp;

  const assessmentInactive =
    session.status !== "in-progress" || remainingSeconds <= 0;

  return (
    <div>
      <header>
        <h1>DSA Assessment</h1>

        <p>
          Language: <strong>{languageConfig.label}</strong>
        </p>

        <p>
          Time Remaining:{" "}
          <strong>{formatTime(remainingSeconds)}</strong>
        </p>
      </header>

      <hr />

      <section>
        <h2>Questions</h2>

        {session.questions.map((question, index) => (
          <button
            key={question._id}
            onClick={() => handleQuestionChange(index)}
            disabled={
              index === activeQuestionIndex ||
              assessmentInactive ||
              savingQuestionId !== null ||
              runningQuestionId !== null
            }
          >
            {index + 1}. {question.difficulty}
          </button>
        ))}
      </section>

      <hr />

      <main>
        <section>
          <h2>{activeQuestion.title}</h2>

          <p>
            Difficulty:{" "}
            <strong>{activeQuestion.difficulty}</strong>
          </p>

          {activeQuestion.tags?.length > 0 && (
            <p>Topics: {activeQuestion.tags.join(", ")}</p>
          )}

          <h3>Problem Statement</h3>

          <div
            dangerouslySetInnerHTML={{
              __html: activeQuestion.problemStatement,
            }}
          />

          {activeQuestion.examples?.length > 0 && (
            <>
              <h3>Examples</h3>

              {activeQuestion.examples.map((example, index) => (
                <pre key={index}>{example}</pre>
              ))}
            </>
          )}

          {activeQuestion.constraints?.length > 0 && (
            <>
              <h3>Constraints</h3>

              <ul>
                {activeQuestion.constraints.map(
                  (constraint, index) => (
                    <li key={index}>{constraint}</li>
                  )
                )}
              </ul>
            </>
          )}

          {activeQuestion.hints?.length > 0 && (
            <>
              <h3>Hints</h3>

              <ul>
                {activeQuestion.hints.map((hint, index) => (
                  <li key={index}>{hint}</li>
                ))}
              </ul>
            </>
          )}
        </section>

        <hr />

        <section>
          <h2>Code Editor</h2>

          <Editor
            height="500px"
            language={languageConfig.monacoLanguage}
            theme="vs-dark"
            value={codes[activeQuestion._id] || ""}
            onChange={handleCodeChange}
            options={{
              minimap: {
                enabled: false,
              },
              fontSize: 15,
              automaticLayout: true,
              scrollBeyondLastLine: false,
              wordWrap: "on",
              tabSize: 2,
              readOnly: assessmentInactive,
            }}
          />

          <br />

          <h3>Custom Input</h3>

          <textarea
            rows="5"
            cols="60"
            placeholder="Enter input for your program..."
            value={stdinByQuestion[activeQuestion._id] || ""}
            onChange={handleInputChange}
            disabled={assessmentInactive}
          />

          <br />
          <br />

          <button
            onClick={() => handleSaveCode()}
            disabled={
              savingQuestionId !== null ||
              runningQuestionId !== null ||
              assessmentInactive
            }
          >
            {savingQuestionId === activeQuestion._id
              ? "Saving..."
              : "Save Code"}
          </button>

          <button
            onClick={handleRunCode}
            disabled={
              runningQuestionId !== null ||
              savingQuestionId !== null ||
              assessmentInactive
            }
          >
            {runningQuestionId === activeQuestion._id
              ? "Running..."
              : "Run Code"}
          </button>

          <button
            onClick={handleSubmitAssessment}
            disabled={
              isSubmitting ||
              runningQuestionId !== null ||
              savingQuestionId !== null ||
              assessmentInactive
            }
          >
            {isSubmitting
              ? "Evaluating Assessment..."
              : "Submit Assessment"}
          </button>

          <h3>Console Output</h3>

          <pre
            style={{
              background: "#111827",
              color: "#f9fafb",
              padding: "16px",
              minHeight: "120px",
              whiteSpace: "pre-wrap",
              overflowX: "auto",
            }}
          >
            {getConsoleOutput()}
          </pre>

          {activeExecution && !activeExecution.error && (
            <div>
              <p>
                Compile Time:{" "}
                {activeExecution.compile?.wallTime !== null &&
                activeExecution.compile?.wallTime !== undefined
                  ? `${activeExecution.compile.wallTime} ms`
                  : "N/A"}
              </p>

              <p>
                Execution Time:{" "}
                {activeExecution.run?.wallTime !== null &&
                activeExecution.run?.wallTime !== undefined
                  ? `${activeExecution.run.wallTime} ms`
                  : "N/A"}
              </p>

              <p>
                Memory:{" "}
                {formatMemory(activeExecution.run?.memory)}
              </p>

              <p>
                Exit Code:{" "}
                {activeExecution.run?.code ?? "N/A"}
              </p>
            </div>
          )}
        </section>
      </main>

      {message && <p>{message}</p>}
    </div>
  );
};

export default DSASessionPage;