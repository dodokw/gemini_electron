// /swagger-autogen.js

require("dotenv").config({ path: "src/dev.env" });
const swaggerAutogen = require("swagger-autogen")({ openapi: "3.0.0" });

// 3. Swagger 기본 문서 정보 (OpenAPI 3.0 기준)
const doc = {
  // ⭐️ 1. (필수) 3.0 버전 선언
  openapi: "3.0.0",

  // ⭐️ 2. (필수) 'swagger: "2.0",' 줄이 여기에 없어야 합니다!

  info: {
    title: "My Electron-Node.js API",
    version: "1.0.0",
    description: "swagger-autogen으로 자동 생성된 API 문서",
  },

  // ⭐️ 3. (필수) 'host'와 'schemes' 대신 'servers' 사용
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 8000}`,
      description: "Development server",
    },
  ],

  consumes: ["application/json"],
  produces: ["application/json"],

  // ⭐️ 4. (유지) 3.0 방식의 보안 설정
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "로그인 API로 발급받은 Access Token을 'Bearer ' 빼고 입력하세요",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

// 4. Swagger JSON 파일이 생성될 위치
const outputFile = "./swagger-output.json";

// 5. routes
const routes = ["./src/app.js"];

// 6. 스크립트 실행
swaggerAutogen(outputFile, routes, doc).then(() => {
  console.log("Swagger JSON 파일 생성 완료: swagger-output.json");
});
