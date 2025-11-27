// /src/controllers/users.controller.js

// 1. 비즈니스 로직을 처리할 Service를 가져옵니다.
const userService = require("../services/users.service");

// getAllUsers 요청을 처리할 핸들러 함수
async function getAllUsersHandler(req, res, next) {
  try {
    // 2. Service를 호출하여 데이터를 받습니다. (req 객체는 넘기지 않음)
    const users = await userService.getAllUsers();

    // 3. Service에서 받은 데이터를 HTTP 응답으로 클라이언트에게 보냅니다.
    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (error) {
    // 4. Service에서 오류가 발생하면, 글로벌 오류 핸들러로 넘깁니다.
    console.error("[Controller Error] getAllUsersHandler:", error);
    next(error); // app.js에 있는 (err, req, res, next) 미들웨어로 전달
  }
}

//회원가입
async function postUsersHandler(req, res, next) {
  const id = req.body.id;
  const password = req.body.password;
  const PCUUID = req.body.PCUUID;
  const mobileUUID = req.body.mobileUUID;

  try {
    const users = await userService.userRegist(req.body);
    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (error) {
    console.error("[Controller Error] postUsersHandler:", error);
    next(error);
  }
}

//로그인
async function loginUsersHandler(req, res, next) {
  const id = req.body.id;
  const password = req.body.password;
  const PCUUID = req.body.PCUUID;
  const mobileUUID = req.body.mobileUUID;

  try {
    const users = await userService.login(req.body);
    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (error) {
    console.error("[Controller Error] loginUsersHandler:", error);
    next(error);
  }
}

//토큰 재발급
async function refreshTokenHandler(req, res, next) {
  const id = req.body.id;
  const refresh_token = req.body.refresh_token;

  try {
    const users = await userService.refreshToken(req.body);
    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (error) {
    console.error("[Controller Error] refreshTokenHandler:", error);
    next(error);
  }
}

// 핸들러 함수를 내보냅니다.
module.exports = {
  getAllUsersHandler,
  postUsersHandler,
  loginUsersHandler,
  refreshTokenHandler,
};
