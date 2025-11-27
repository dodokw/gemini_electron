#디렉토리 구조

/my-project
├── node_modules/ (설치된 라이브러리들)
├── prisma/ (Prisma 사용 시: 스키마/마이그레이션 파일)
│
├── src/ (우리의 모든 소스 코드가 담길 폴더)
│ ├── routes/ (API 경로(엔드포인트) 정의)
│ │ ├── index.js (모든 라우터를 모아주는 파일)
│ │ ├── users.routes.js (사용자 관련 API 경로)
│ │ └── gemini.routes.js (node-pty CLI 관련 API 경로)
│ │
│ ├── controllers/ (요청(Request)과 응답(Response)을 처리)
│ │ ├── users.controller.js
│ │ └── gemini.controller.js
│ │
│ ├── services/ (핵심 비즈니스 로직, DB 작업)
│ │ ├── users.service.js
│ │ └── gemini.service.js (node-pty 실행 로직은 여기에)
│ │
│ ├── middlewares/ (라우터 실행 전/후에 실행되는 중간 처리기)
│ │ └── auth.middleware.js (JWT 토큰 검증 로직)
│ │
│ ├── config/ (설정 파일)
│ │ └── config.js (.env 파일에서 읽어온 변수들을 관리)
│ │
│ └── app.js (Express 앱의 본체: cors, 미들웨어 설정)
│
├── .env (환경 변수 - DB 비번, JWT 키 등 **절대 Git에 올리면 안 됨**)
├── .gitignore (Git에 올리지 않을 파일 목록 - .env, node_modules)
├── server.js (서버를 실제로 실행(listen)하는 파일 - 시작점)
└── package.json
