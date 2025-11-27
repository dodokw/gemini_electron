// /src/config/db.js

const { Pool } = require("pg");

// .env 파일에서 환경 변수를 자동으로 읽어옵니다.
// (server.js에서 이미 실행했다면 여기서 또 할 필요는 없지만,
// 이 파일이 독립적으로 실행될 경우를 대비해 두는 것이 안전합니다.)
// require("dotenv").config({ path: "../dev.env" });

// pg Pool 생성
const pool = new Pool({
  // host: process.env.DB_HOST, // localhost
  // port: process.env.DB_PORT, // 5432
  // user: process.env.DB_USER, // postgres
  // password: process.env.DB_PASSWORD, // .env 파일의 비밀번호
  // database: process.env.DB_NAME, // gemini
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "rhehd9306!",
  database: "gemini",

  // (선택) 풀 설정
  max: 20, // 풀이 가질 수 있는 최대 커넥션 수
  idleTimeoutMillis: 30000, // 유휴 커넥션이 풀에 머무는 시간 (ms)
  connectionTimeoutMillis: 2000, // 커넥션 시도 타임아웃 (ms)
});

// 생성한 풀(pool) 객체를 모듈로 내보냅니다.
// 이제 다른 파일에서 이 'pool'을 require하여 DB 쿼리를 실행할 수 있습니다.
module.exports = pool;
