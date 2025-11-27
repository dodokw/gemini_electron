import React, { useState, useEffect } from "react";
import { regist } from "../../../api/users/regist";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// src/electron.d.ts

declare global {
  interface Window {
    electronAPI: {
      getMachineId: () => Promise<string>;
      goBack: () => void;
      goForward: () => void;
      minimize: () => void;
      maximize: () => void;
      close: () => void;
    };
  }
}

const Regist = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMachineId = async () => {
      const id = await window.electronAPI.getMachineId();
      console.log("Machine ID:", id);
      setDeviceId(id);
    };

    fetchMachineId();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("[패스워드]와 [패스워드 재확인]이 일치하지 않습니다.");
      return;
    }
    // TODO: 실제 회원가입 로직을 여기에 구현하세요.
    console.log("회원가입 정보:", { email, password, deviceId });
    // alert("회원가입이 요청되었습니다.");
    regist({
      id: email,
      password: password,
      PCUUID: deviceId,
      mobileUUID: "",
    }).then((res) => {
      console.log(res);
      // alert(`result1: ${res?.message}`);
      if (res?.code === "200") {
        alert(res?.message);
        navigate("/login");
      } else {
        alert(res?.message);
      }
    });
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>회원가입</h2>
        <div style={styles.inputGroup}>
          <label htmlFor="id">이메일</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        <div style={styles.inputGroup}>
          <label htmlFor="deviceId">기기 고유 ID</label>
          <input
            type="text"
            id="deviceId"
            value={deviceId}
            style={styles.input}
            disabled // 사용자가 수정할 수 없도록 비활성화
            readOnly
          />
        </div>
        <div style={styles.inputGroup}>
          <label htmlFor="password">패스워드</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        <div style={styles.inputGroup}>
          <label htmlFor="confirmPassword">패스워드 재확인</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
            required
          />
        </div>
        <button type="submit" style={styles.button}>
          가입하기
        </button>
      </form>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#121212", // 다크 테마 배경색
    paddingTop: "32px", // TitleBar 높이만큼 패딩 추가
    color: "#b0b0b0",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: "350px",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
    backgroundColor: "#1e1e1e", // 폼 배경색
    color: "#c9d1d9", // 폼 내부 기본 텍스트 색상
  },
  inputGroup: {
    marginBottom: "20px",
    fontSize: "14px",
    color: "#b0b0b0",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #4f545c",
    boxSizing: "border-box",
    marginTop: "5px",
    backgroundColor: "#23272a",
    color: "#ffffff",
  },
  button: {
    padding: "10px",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#8a2be2", // 요청하신 버튼 색상
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
  },
  title: {
    marginTop: "0px",
    marginBottom: "10px",
    fontSize: "24px",
    fontWeight: "600",
    textAlign: "center",
  },
};

export default Regist;
