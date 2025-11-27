// /src/config/swagger.js

const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  // 1. Swagger 명세서(API 사양)에 대한 기본 정보
  definition: {
    openapi: "3.0.0", // OpenAPI 버전
    info: {
      title: "My Electron-Node.js API",
      version: "1.0.0",
      description: "Electron 앱과 통신하는 백엔드 API 명세서",
    },
    // (선택) API 서버 URL
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8000}`, // .env의 포트와 맞추세요
      },
    ],
  },
  // 2. JSDoc 주석이 달린 API 파일 경로
  //    이 경로의 파일들을 읽어서 API 문서를 생성합니다.
  //    프로세스 실행 위치에 상관없이 파일 경로를 보장하기 위해 path.join을 사용합니다.
  apis: [
    "./src/routes/*.js", // 프로젝트 루트 기준, routes 폴더의 모든 .js 파일을 대상으로 합니다.
  ],
};

// JSDoc 옵션을 바탕으로 Swagger 스펙 객체 생성
const specs = swaggerJsdoc(options);

// 생성된 스펙을 모듈로 내보냅니다.
module.exports = specs;
