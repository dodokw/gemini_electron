// /server.js

// (중요) .env 파일의 환경 변수를 가장 먼저 로드합니다.
// .env 파일에 PORT=8000, JWT_SECRET_KEY=... 등이 있어야 합니다.
require("dotenv").config({ path: "./src/dev.env" });

// src/app.js 에서 설정이 완료된 Express 앱을 가져옵니다.
const app = require("./src/app");

// .env 파일에서 포트 번호를 읽어오거나, 없으면 8000번을 기본값으로 사용합니다
const PORT = process.env.PORT || 8000;

// 서버를 실행합니다.
app.listen(PORT, () => {
  console.log(`🚀 서버가 ${PORT}번 포트에서 실행 중입니다.`);
});
