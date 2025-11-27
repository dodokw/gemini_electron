// /src/services/users.service.js (예시)

// 1. config 파일에서 DB 연결 풀을 가져옵니다.
const { fi } = require("zod/locales");
const pool = require("../config/db.js");
const { errorCode } = require("../tools/error.code.js");
// randomFourNumber
const randomFourNumber = require("../tools/randomNumber.js");
const dayjs = require("dayjs");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");

// (가상) 모든 유저를 가져오는 서비스 함수
async function getAllUsers() {
  let client = null;
  try {
    // 2. 풀에서 커넥션(client)을 하나 빌립니다.
    client = await pool.connect();

    // 3. 쿼리를 실행합니다.
    const result = await client.query("SELECT * FROM users");

    // 4. 결과를 반환합니다.
    return result.rows; // (rows에 실제 데이터가 들어있습니다)
  } catch (error) {
    // 5. 오류 처리
    console.error("DB 쿼리 오류:", error);
    throw error; // 컨트롤러로 오류를 다시 던집니다.
  } finally {
    // 6. (매우 중요) 사용한 커넥션을 반드시 풀에 반납합니다.
    if (client) {
      client.release();
    }
  }
}

//user Regist
async function userRegist(data) {
  let client = null;
  const secret_key = process.env.JWT_SECRET_KEY;

  //아이디 중복 체크
  const findIdQueryText = `
  SELECT * FROM users WHERE id = $1
  `;

  const jwt_key = randomFourNumber() + data.id + dayjs().valueOf();
  const user_uid = data.id + dayjs().valueOf();
  const created_date = dayjs().format("YYYY-MM-DD");
  const password = await bcrypt.hash(data.password, 10);
  const pc_uid = data.PCUUID;
  const mobile_uid = data.mobileUUID;

  if (!pc_uid && !mobile_uid) {
    return {
      body: {
        code: "400",
        message: "비정상적인 접근 방법입니다.",
      },
    };
  }

  // 1. SQL 쿼리문: 값을 $1, $2, $3... 등으로 대체합니다.
  const registQueryText = `
    INSERT INTO users (id, password, jwt_key, created_date, user_uid, pc_uid, mobile_uid)
    VALUES($1, $2, $3, $4, $5, $6, $7)
    RETURNING * `;
  // RETURNING * : INSERT된 행의 데이터를 반환받을 수 있습니다.

  // 2. 쿼리문에 전달할 값 배열: $1, $2 순서에 맞게 값을 넣습니다.
  const values = [
    data.id,
    password,
    jwt_key,
    created_date,
    user_uid,
    pc_uid,
    mobile_uid,
  ];

  try {
    client = await pool.connect();

    const findIdResult = await client.query(findIdQueryText, [data.id]);
    if (findIdResult.rows.length > 0) {
      return {
        body: {
          code: errorCode.idExist,
          message: "이미 존재하는 아이디입니다.",
        },
      };
    }

    // 3. client.query에 쿼리 텍스트와 값 배열을 따로 전달합니다.
    const registResult = await client.query(registQueryText, values);

    // RETURNING *를 사용했으므로 result.rows에 삽입된 데이터가 들어옵니다.
    // return registResult.rows;
    if (registResult.rows.length > 0) {
      return {
        body: {
          code: "200",
          message: "회원가입 성공",
        },
      };
    }
  } catch (error) {
    console.error("DB 쿼리 오류:", error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

//user login
async function login(data) {
  let client = null;

  const id = data.id;
  const password = data.password;
  const pc_uid = data.PCUUID;
  const mobile_uid = data.mobileUUID;

  try {
    client = await pool.connect();
    const user = await client.query(
      "SELECT password, jwt_key, pc_uid, mobile_uid FROM users WHERE id = $1",
      [id]
    );
    if (user.rows.length === 0) {
      return {
        body: {
          code: "400",
          message: "존재하지 않는 아이디이거나 비밀번호가 일치하지 않습니다.",
        },
      };
    }
    if (!pc_uid && !mobile_uid) {
      return {
        body: {
          code: "400",
          message: "비정상적인 접근 방법입니다.",
        },
      };
    }
    if (user.rows[0].pc_uid !== pc_uid && !mobile_uid) {
      return {
        body: {
          code: "400",
          message: "PC UUID가 일치하지 않습니다.",
        },
      };
    }
    if (user.rows[0].mobile_uid !== mobile_uid && !pc_uid) {
      return {
        body: {
          code: "400",
          message: "Mobile UUID가 일치하지 않습니다.",
        },
      };
    }

    // console.log("user[0].password::", user.rows[0].password);
    const compare_password = await bcrypt.compare(
      password,
      user.rows[0].password
    );
    if (compare_password) {
      // access_token, refresh_token 생성
      const access_token = jsonwebtoken.sign({ id: id }, user.rows[0].jwt_key, {
        expiresIn: "1d",
      });
      const refresh_token = jsonwebtoken.sign(
        { id: id },
        user.rows[0].jwt_key,
        {
          expiresIn: "7d",
        }
      );
      return {
        body: {
          code: "200",
          message: "로그인 성공",
          id: id,
          access_token: access_token,
          refresh_token: refresh_token,
        },
      };
    } else {
      return {
        body: {
          code: "400",
          message: "존재하지 않는 아이디이거나 비밀번호가 일치하지 않습니다.",
        },
      };
    }
    // return result.rows;
  } catch (error) {
    console.error("DB 쿼리 오류:", error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

//refresh token
async function refreshToken(data) {
  let client = null;

  const id = data.id;
  const refresh_token = data.refresh_token;
  try {
    client = await pool.connect();
    const user = await client.query("SELECT jwt_key FROM users WHERE id = $1", [
      id,
    ]);
    if (user.rows.length === 0) {
      return {
        body: {
          code: "400",
          message: "존재하지 않는 아이디이거나 비밀번호가 일치하지 않습니다.",
        },
      };
    }
    const compare_refresh_token = jsonwebtoken.verify(
      refresh_token,
      user.rows[0].jwt_key
    );
    if (compare_refresh_token) {
      const access_token = jsonwebtoken.sign({ id: id }, user.rows[0].jwt_key, {
        expiresIn: "1d",
      });
      const refresh_token = jsonwebtoken.sign(
        { id: id },
        user.rows[0].jwt_key,
        {
          expiresIn: "7d",
        }
      );
      return {
        body: {
          code: "200",
          message: "토큰 재발급 성공",
          access_token: access_token,
          refresh_token: refresh_token,
        },
      };
    } else {
      return {
        body: {
          code: "400",
          message: "토큰 재발급 실패",
        },
      };
    }
    // return result.rows;
  } catch (error) {
    console.error("DB 쿼리 오류:", error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

module.exports = { getAllUsers, userRegist, login, refreshToken };
