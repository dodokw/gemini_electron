// /src/middlewares/auth.middleware.js

const jsonwebtoken = require("jsonwebtoken");
const pool = require("../config/db.js");

async function authMiddleware(req, res, next) {
  // 1. Authorization 헤더에서 토큰 추출
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "error",
      message: "인증 토큰이 없거나 형식이 올바르지 않습니다.",
    });
  }

  const token = authHeader.split(" ")[1];
  let client = null;

  try {
    // 2. 토큰에서 서명 검증 없이 payload만 디코딩하여 사용자 ID 획득
    const decodedWithoutVerification = jsonwebtoken.decode(token);

    if (!decodedWithoutVerification || !decodedWithoutVerification.id) {
      return res.status(401).json({
        status: "error",
        message: "토큰이 유효하지 않습니다.",
      });
    }

    const { id } = decodedWithoutVerification;

    // 3. DB에서 해당 사용자의 jwt_key 조회
    client = await pool.connect();
    const userResult = await client.query(
      "SELECT jwt_key FROM users WHERE id = $1",
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "토큰에 해당하는 사용자를 찾을 수 없습니다.",
      });
    }

    const { jwt_key } = userResult.rows[0];

    // 4. 조회한 jwt_key를 사용하여 토큰 서명 검증
    const decoded = jsonwebtoken.verify(token, jwt_key);

    // 5. 검증 성공 시, req 객체에 사용자 정보 추가
    req.user = decoded; // { id: '...' }
    next();
  } catch (error) {
    console.error("[Auth Middleware Error]:", error.name, error.message);

    if (error instanceof jsonwebtoken.TokenExpiredError) {
      return res.status(401).json({
        status: "error",
        message: "토큰이 만료되었습니다.",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({
      status: "error",
      message: "유효하지 않은 토큰입니다.",
      code: "INVALID_TOKEN",
    });
  } finally {
    if (client) {
      client.release();
    }
  }
}

module.exports = authMiddleware;
