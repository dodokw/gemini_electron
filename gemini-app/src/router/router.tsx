import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ChatPage from "../pages/ChatPage";
import Login from "../pages/loginPages/login";
import Regist from "../pages/loginPages/Regist";
import { RootState } from "../store/RootReducer";
import { useDispatch } from "react-redux";
import { setInitialized } from "../store/user";

const Router = ({ user }: { user: RootState["user"] }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // dispatch(setInitialized());
    user.id ? navigate("/chat") : navigate("/login");
    // alert(user.id);
    // navigate("/login");
  }, [user]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/regist" element={<Regist />} />
    </Routes>
  );
};

export default Router;
