import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import axios from "axios";
import AppShell, { ErrorState, LoadingState } from "../components/AppShell";

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
    return <LoadingState label="Preparing coding workspace..." />;
  }

  if (message && !session) {
    return <ErrorState message={message} />;
  }

  if (!session || !activeQuestion) {
    return <ErrorState message="Assessment session not found." />;
  }

  const languageConfig =
    LANGUAGE_CONFIG[session.language] || LANGUAGE_CONFIG.cpp;

  const assessmentInactive = false;

  return (
    <AppShell compact>
    <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div><p className="eyebrow">Coding workspace</p><h1 className="font-display text-2xl">DSA Assessment</h1></div>

        <div className="flex items-center gap-3"><p className="badge">
          Language: <strong>{languageConfig.label}</strong>
        </p>

        <p className="rounded-sm bg-ink px-4 py-2 text-sm text-white">
          Time Remaining:{" "}
          <strong>{formatTime(remainingSeconds)}</strong>
        </p></div>
      </header>

      <section className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="mr-2 text-xs font-bold uppercase tracking-wider text-slate-400">Questions</h2>

        {session.questions.map((question, index) => (
          <button className={`btn min-h-9 px-3 py-1.5 ${index === activeQuestionIndex ? "btn-primary" : "btn-secondary"}`}
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

      <main className="grid gap-4 xl:grid-cols-[minmax(340px,0.8fr)_minmax(600px,1.4fr)]">
        <section className="card max-h-[calc(100vh-10rem)] overflow-y-auto">
          <h2 className="font-display text-2xl">{activeQuestion.title}</h2>

          <p className="mt-2 text-sm text-slate-500">
            Difficulty:{" "}
            <strong>{activeQuestion.difficulty}</strong>
          </p>

          {activeQuestion.tags?.length > 0 && (
            <p className="mt-2 text-sm text-slate-500">Topics: {activeQuestion.tags.join(", ")}</p>
          )}

          <h3 className="mt-7 border-b border-line pb-2 text-sm font-bold uppercase tracking-wider">Problem statement</h3>

          <div className="prose-copy mt-4"
            dangerouslySetInnerHTML={{
              __html: activeQuestion.problemStatement,
            }}
          />

          {activeQuestion.examples?.length > 0 && (
            <>
              <h3 className="mt-7 border-b border-line pb-2 text-sm font-bold uppercase tracking-wider">Examples</h3>

              {activeQuestion.examples.map((example, index) => (
                <pre className="mt-3 overflow-x-auto rounded-sm bg-slate-100 p-4 text-xs leading-6" key={index}>{example}</pre>
              ))}
            </>
          )}

          {activeQuestion.constraints?.length > 0 && (
            <>
              <h3 className="mt-7 border-b border-line pb-2 text-sm font-bold uppercase tracking-wider">Constraints</h3>

              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
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
              <h3 className="mt-7 border-b border-line pb-2 text-sm font-bold uppercase tracking-wider">Hints</h3>

              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                {activeQuestion.hints.map((hint, index) => (
                  <li key={index}>{hint}</li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className="overflow-hidden rounded-sm border border-slate-700 bg-[#1e1e1e] shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3 text-white"><h2 className="text-sm font-semibold">Solution · {languageConfig.label}</h2><span className="text-xs text-slate-400">Auto-saved on question change</span></div>

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

          <div className="border-t border-slate-700 p-4"><h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Custom input</h3>

          <textarea className="w-full resize-y rounded-sm border border-slate-600 bg-[#151515] p-3 font-mono text-sm text-slate-100 outline-none focus:border-slate-400"
            rows="5"
            cols="60"
            placeholder="Enter input for your program..."
            value={stdinByQuestion[activeQuestion._id] || ""}
            onChange={handleInputChange}
            disabled={assessmentInactive}
          />

          <div className="mt-3 flex flex-wrap gap-2"><button className="btn border-slate-600 bg-transparent text-slate-200 hover:bg-slate-800"
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

          <button className="btn border-slate-500 bg-slate-700 text-white hover:bg-slate-600"
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

          <button className="btn ml-auto border-rust bg-rust text-white hover:bg-[#8e3f36]"
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
          </button></div>

          <h3 className="mt-5 border-t border-slate-700 pt-4 text-xs font-bold uppercase tracking-wider text-slate-400">Console output</h3>

          <pre
            style={{
              background: "#111111",
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
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400 sm:grid-cols-4">
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
          )}</div>
        </section>
      </main>

      {message && <div className="notice notice-error mt-4">{message}</div>}
    </div>
    </AppShell>
  );
};

export default DSASessionPage;
