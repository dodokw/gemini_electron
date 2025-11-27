import React, { useEffect, useState } from "react";
import "./styles.css";
import axios from "axios";
import { login } from "../../../api/users/login";
import { useDispatch, useSelector } from "react-redux";
import { setInitialized, setUserInfo } from "../../../store/user";
import { RootState } from "../../../store/RootReducer"; // useNavigate를 Link로 변경합니다.
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const test = 1;

  useEffect(() => {
    const fetchMachineId = async () => {
      const id = await window.electronAPI.getMachineId();
      console.log("Machine ID:", id);
      setDeviceId(id);
    };
    fetchMachineId();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt with:", { email, password });

    login({
      id: email,
      password: password,
      PCUUID: deviceId,
      mobileUUID: "",
    }).then((res) => {
      console.log(res);
      if (res?.code === "200") {
        dispatch(
          setUserInfo({
            id: res?.id,
            accessToken: res?.access_token,
            refreshToken: res?.refresh_token,
          })
        );
        // navigate("/chat");
      } else {
        alert(res?.message);
      }
    });
  };

  // dispatch(setInitialized());

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>G-CLI 체험단 여러분 환영합니다</h1>
        <p className="login-subtitle">계속하려면 로그인하세요.</p>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">이메일 주소</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소를 입력하세요"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>
          <button type="submit" className="login-button">
            계속
          </button>
        </form>
        <div className="login-links">
          <Link to="/find-id">아이디 찾기</Link>
          <span className="separator">|</span>
          <Link to="/reset-password">비밀번호 찾기</Link>
          <span className="separator">|</span>
          <Link to="/regist">회원가입</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
