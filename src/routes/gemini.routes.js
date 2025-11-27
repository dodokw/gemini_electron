// /src/routes/gemini.routes.js

const express = require("express");
const router = express.Router();
const geminiController = require("../controllers/gemini.controller");
const authMiddleware = require("../middlewares/auth.middleware.js");

// 컨트롤러를 직접 호출하고, 반환된 Promise를 처리합니다.
router.post("/send-prompt", authMiddleware, async (req, res, next) => {
  try {
    const result = await geminiController.sendGeminiPrompt(req, res, next);
    res.json(result);
  } catch (error) {
    // 컨트롤러에서 reject된 오류를 처리합니다.
    // status와 body가 있으면 그것을 사용하고, 없으면 일반 오류로 처리합니다.
    res
      .status(error.status || 500)
      .json(error.body || { error: error.message });
  }
});

router.get("/status", authMiddleware, async (req, res) => {
  // 🔴 (수정) /status 핸들러 내부에서도 req.app에서 상태를 가져와야 합니다.
  const geminiProcess = req.app.get("geminiProcess");
  const isReady = req.app.get("isReady");

  res.json({
    processRunning: geminiProcess !== null,
    ready: isReady,
    pid: geminiProcess?.pid,
  });
});

// 완성된 라우터 객체를 내보냅니다.
module.exports = router;
