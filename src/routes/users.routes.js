// /src/routes/users.routes.js

const express = require("express");
const router = express.Router();
const userController = require("../controllers/users.controller");

// 1. 'GET /' (즉, /api/users) 요청이 오면
// 2. userController의 getAllUsersHandler 함수를 실행하도록 연결합니다.

router.get("/find-all", userController.getAllUsersHandler);
router.post("/regist", userController.postUsersHandler);
router.post("/login", userController.loginUsersHandler);
router.post("/refresh-token", userController.refreshTokenHandler);

// (예시) 나중에 POST / (즉, /api/users) 요청도 추가할 수 있습니다.
// router.post("/", userController.createUserHandler);

module.exports = router;
