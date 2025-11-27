// /src/routes/index.js

const express = require("express");
const router = express.Router();

// 🔴 (수정) 팩토리 함수가 아닌, 일반 라우터 모듈을 require
const geminiRouter = require("./gemini.routes");
const usersRoutes = require("./users.routes");

// 🔴 스캐너가 이 '/gemini' 접두사를 읽음
router.use("/gemini", geminiRouter);
router.use("/users", usersRoutes);

router.get("/ping", (req, res) => {
  res.status(200).json({ message: "pong from index" });
});

// 🔴 (수정) 팩토리 함수가 아닌, router 객체를 바로 export
module.exports = router;
