// /src/app.js

const express = require("express");
const cors = require("cors");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("../swagger-output.json");
const mainRouter = require("./routes");

const app = express();

let isReady = false;
let geminiProcess = null;

const pty = require("node-pty");

const isProduction = process.env.NODE_ENV === "production";

// ANSI 이스케이프 코드를 제거하는 정규식
const ansiRegex = /\x1b\[[0-9;?]*[a-zA-Z]/g;

// nvm으로 설치된 node와 gemini의 절대 경로
const nodePath = "/Users/godong-gwan/.nvm/versions/node/v22.0.0/bin/node";
const geminiScriptPath =
  "/Users/godong-gwan/.nvm/versions/node/v22.0.0/lib/node_modules/@google/gemini-cli/dist/index.js";

// ===== 핵심 수정: nvm 경로를 PATH에 추가 =====
const nvmBinPath = path.dirname(nodePath); // /Users/godong-gwan/.nvm/versions/node/v22.0.0/bin
const nvmNodeModulesBinPath = path.join(
  path.dirname(path.dirname(nodePath)),
  "lib",
  "node_modules",
  ".bin"
); // /Users/godong-gwan/.nvm/versions/node/v22.0.0/lib/node_modules/.bin

function startGeminiCli() {
  // 환경변수에 nvm 경로 추가
  const customEnv = {
    ...process.env,
    // 기존 PATH 앞에 nvm 관련 경로들을 추가
    PATH: `${nvmBinPath}:${nvmNodeModulesBinPath}:${process.env.PATH || ""}`,
    // NODE_PATH도 명시적으로 설정 (선택사항, 일부 도구에서 필요)
    NODE_PATH: path.join(
      path.dirname(path.dirname(nodePath)),
      "lib",
      "node_modules"
    ),
    // Playwright 브라우저 경로 명시 (macOS 기준)
    PLAYWRIGHT_BROWSERS_PATH: `${process.env.HOME}/Library/Caches/ms-playwright`,
    // Playwright가 브라우저를 찾지 못할 때를 대비한 추가 환경변수
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: "0",
  };

  geminiProcess = pty.spawn(nodePath, [geminiScriptPath, "--yolo"], {
    name: "xterm-color",
    cols: 80,
    rows: 30,
    cwd: path.dirname(geminiScriptPath),
    env: customEnv, // 수정된 환경변수 사용
  });

  console.log(
    `[INFO] Gemini CLI 시작됨 (PID: ${geminiProcess.pid}, Path: ${geminiScriptPath})`
  );
  console.log(`[INFO] PATH: ${customEnv.PATH}`);

  app.set("geminiProcess", geminiProcess);
  app.set("isReady", isReady);

  let lineBuffer = "";

  const initHandler = (data) => {
    lineBuffer += data.toString("utf8");
    let newlineIndex;

    while ((newlineIndex = lineBuffer.indexOf("\n")) !== -1) {
      const line = lineBuffer.slice(0, newlineIndex);
      lineBuffer = lineBuffer.slice(newlineIndex + 1);

      const cleanLine = line.replace(ansiRegex, "").trim();

      if (cleanLine) {
        console.log(`[INIT] ${cleanLine}`);
      }
    }
  };

  geminiProcess.onData(initHandler);

  setTimeout(() => {
    if (geminiProcess) {
      isReady = true;
      console.log("[INFO] Gemini CLI 준비 완료!\n");

      if (lineBuffer.length > 0) {
        const cleanRemainder = lineBuffer.replace(ansiRegex, "").trim();
        if (cleanRemainder) {
          console.log(`[INIT] ${cleanRemainder}`);
        }
      }

      app.set("isReady", isReady);

      // 디버깅용: 모든 출력을 계속 로깅
      geminiProcess.onData((data) => {
        const output = data.toString("utf8").replace(ansiRegex, "").trim();
        if (output) {
          console.log(`[GEMINI] ${output}`);
        }
      });
    }
  }, 3000);

  geminiProcess.onExit(({ exitCode, signal }) => {
    console.log(`[INFO] Gemini CLI 프로세스 종료 (코드: ${exitCode})`);
    geminiProcess = null;
    isReady = false;
    app.set("geminiProcess", null);
    app.set("isReady", false);
  });
}

startGeminiCli();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).send("🚀 API Server is running!");
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use("/api", mainRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: err.message || "서버 내부 오류가 발생했습니다.",
  });
});

module.exports = app;
