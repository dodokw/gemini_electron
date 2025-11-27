async function sendGeminiPrompt(req, res, next) {
  return new Promise((resolve, reject) => {
    const ansiRegex = /\x1b\[[0-9;?]*[a-zA-Z]/g;
    const { prompt } = req.body;

    const geminiProcess = req.app.get("geminiProcess");
    const isReady = req.app.get("isReady");

    if (!geminiProcess || !isReady) {
      const error = new Error("Gemini CLI가 준비되지 않았습니다.");
      error.status = 503;
      error.body = {
        error: "Gemini CLI가 준비되지 않았습니다.",
        ready: isReady,
      };
      return reject(error);
    }

    console.log(`\n[REQUEST] 프롬프트: "${prompt}"`);

    let responseBuffer = "";
    let timeout;
    let checkInterval;
    let lastDataTime = Date.now();
    let dataCount = 0;
    let responseComplete = false;

    const dataHandler = (data) => {
      if (responseComplete) return;

      dataCount++;
      const dataStr = data.toString("utf8");
      responseBuffer += dataStr;
      lastDataTime = Date.now();
      console.log(
        `[DATA] 수신 중... (청크 #${dataCount}, ${data.length} bytes)`
      );
    };

    geminiProcess.onData(dataHandler);

    console.log(`[SEND] 전송 중...`);
    geminiProcess.write(prompt + "\r");
    setTimeout(() => {
      geminiProcess.write("\r");
    }, 500);

    checkInterval = setInterval(() => {
      const timeSinceLastData = Date.now() - lastDataTime;

      if (dataCount > 0 && timeSinceLastData > 6000) {
        clearInterval(checkInterval);
        clearTimeout(timeout);
        processResponse();
      }
    }, 500);

    function processResponse() {
      if (responseComplete) return;
      responseComplete = true;

      if (geminiProcess) {
        geminiProcess.onData(() => {});
      }

      let cleanResponse = responseBuffer
        .replace(ansiRegex, "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n");

      console.log(`[DEBUG] 전체 응답:\n${cleanResponse}\n`);

      const lines = cleanResponse.split("\n");

      // 메타정보 필터링 패턴들
      const metaPatterns = [
        /[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/, // 스피너
        /Synthesizing and Responding/,
        /Decomposing the Request/,
        /Defining My Action Plan/,
        /esc to cancel/,
        /Using.*MCP servers/,
        /YOLO mode/,
        /ctrl\+/,
        /Type your message/,
        /gemini-[\d.]+[-\w]*/,
        /context\s+(left|\|)/,
        /\(see\s*\/docs\)/,
        /error\s*\(ctrl\+o/,
        /for details\)/,
        /[│╭╰─╮]/,
        /^\s*>\s*$/,
        /no\s+sandbox/,
        /\(main\*?\)/,
        /@path\/to\/file/,
        /node_modules/,
        /\.nvm\/versions/,
        /lib\/node_modules/,
        /\/Volumes\//,
      ];

      // 실제 응답 라인들만 수집
      const contentLines = [];

      for (const line of lines) {
        let trimmed = line.trim();

        if (!trimmed) continue;

        // [숫자] 프리픽스 제거
        trimmed = trimmed.replace(/^\[\d+\]\s*/, "");
        if (!trimmed) continue;

        // /docs) details) 같은 메타정보 조각 제거
        trimmed = trimmed.replace(/\/docs\)\s+details\)/gi, "");
        trimmed = trimmed.replace(/sandbox\s+\(.*?context.*?\)/gi, "");
        trimmed = trimmed.replace(/error\s*\|/gi, "");
        trimmed = trimmed.trim();

        if (!trimmed) continue;

        // 메타정보인지 체크
        let isMeta = false;
        for (const pattern of metaPatterns) {
          if (pattern.test(trimmed)) {
            isMeta = true;
            break;
          }
        }
        if (isMeta) continue;

        // ✦ 마커 제거
        trimmed = trimmed.replace(/^✦\s*/, "").trim();
        if (!trimmed) continue;

        // 파일 경로 정보는 제외
        if (
          trimmed.includes("/") &&
          (trimmed.includes("node") ||
            trimmed.includes("lib") ||
            trimmed.includes("dist"))
        ) {
          continue;
        }

        contentLines.push(trimmed);
      }

      console.log(`[EXTRACTED] 추출된 라인들 (${contentLines.length}개)`);

      // 중복 제거: 포함 관계 체크
      const uniqueLines = [];

      for (const line of contentLines) {
        // 정규화: 마크다운, 공백 정리
        const normalizedLine = line
          .replace(/\*\*/g, "")
          .replace(/\s+/g, " ")
          .trim();

        if (!normalizedLine) continue;

        // 이미 추가된 라인들과 비교
        let shouldAdd = true;

        for (let i = 0; i < uniqueLines.length; i++) {
          const existingLine = uniqueLines[i]
            .replace(/\*\*/g, "")
            .replace(/\s+/g, " ")
            .trim();

          // 케이스 1: 새 라인이 기존 라인에 완전히 포함됨 (짧은 버전)
          if (existingLine.includes(normalizedLine)) {
            shouldAdd = false;
            break;
          }

          // 케이스 2: 기존 라인이 새 라인에 포함됨 (긴 버전으로 업데이트)
          if (normalizedLine.includes(existingLine)) {
            uniqueLines[i] = line; // 더 긴 버전으로 교체
            shouldAdd = false;
            break;
          }

          // 케이스 3: 완전히 동일
          if (normalizedLine === existingLine) {
            shouldAdd = false;
            break;
          }
        }

        if (shouldAdd) {
          uniqueLines.push(line);
        }
      }

      console.log(
        `[UNIQUE] 중복 제거 후 (${uniqueLines.length}개):`,
        uniqueLines
      );

      // 모든 응답을 개행으로 연결
      let fullResponse = uniqueLines.join("\n").trim();

      console.log(`[COMPLETE] 최종 응답:\n${fullResponse}`);

      if (fullResponse) {
        resolve({
          status: "success",
          output: fullResponse,
        });
      } else {
        resolve({
          status: "success",
          output: "응답 없음",
          debug: {
            extractedLines: contentLines.length,
            uniqueLines: uniqueLines.length,
            totalLines: lines.length,
          },
        });
      }
    }

    timeout = setTimeout(() => {
      clearInterval(checkInterval);
      console.log(`[TIMEOUT] 데이터 수신 횟수: ${dataCount}`);

      if (dataCount > 0) {
        processResponse();
      } else {
        const error = new Error("응답 없음 (타임아웃)");
        error.status = 504;
        error.body = {
          error: "응답 없음",
          hint: "gemini CLI가 응답하지 않습니다.",
        };
        reject(error);
      }
    }, 40000);
  });
}

module.exports = { sendGeminiPrompt };
