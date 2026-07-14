const LANGUAGE_CONFIG = {
  cpp: {
    language: "c++",
    version: "10.2.0",
    fileName: "main.cpp",
  },

  java: {
    language: "java",
    version: "15.0.2",
    fileName: "Main.java",
  },

  python: {
    language: "python",
    version: "3.12.0",
    fileName: "main.py",
  },
};

const getPistonBaseUrl = () => {
  const url = process.env.PISTON_API_URL;

  if (!url) {
    throw new Error("PISTON_API_URL is not configured");
  }

  return url.replace(/\/$/, "");
};

export const executeCode = async ({
  language,
  sourceCode,
  stdin = "",
}) => {
  const config = LANGUAGE_CONFIG[language];

  if (!config) {
    throw new Error("Unsupported programming language");
  }

  if (!sourceCode || sourceCode.trim() === "") {
    throw new Error("Source code cannot be empty");
  }

  const baseUrl = getPistonBaseUrl();

  const response = await fetch(`${baseUrl}/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      language: config.language,
      version: config.version,

      files: [
        {
          name: config.fileName,
          content: sourceCode,
        },
      ],

      stdin,

      compile_timeout: 30000,
      compile_cpu_time: 30000,
      run_timeout: 3000,
      run_cpu_time: 3000,

      compile_memory_limit: -1,
      run_memory_limit: -1,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Unable to execute code using Piston"
    );
  }

  return {
    language: data.language,
    version: data.version,

    compile: {
      stdout: data.compile?.stdout || "",
      stderr: data.compile?.stderr || "",
      output: data.compile?.output || "",
      code: data.compile?.code ?? null,
      signal: data.compile?.signal || null,
      message: data.compile?.message || "",
      status: data.compile?.status || null,
      memory: data.compile?.memory ?? null,
      cpuTime: data.compile?.cpu_time ?? null,
      wallTime: data.compile?.wall_time ?? null,
    },

    run: {
      stdout: data.run?.stdout || "",
      stderr: data.run?.stderr || "",
      output: data.run?.output || "",
      code: data.run?.code ?? null,
      signal: data.run?.signal || null,
      message: data.run?.message || "",
      status: data.run?.status || null,
      memory: data.run?.memory ?? null,
      cpuTime: data.run?.cpu_time ?? null,
      wallTime: data.run?.wall_time ?? null,
    },
  };
};