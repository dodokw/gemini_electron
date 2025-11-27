import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../store/RootReducer";

function HomePage() {
  const user = useSelector((state: RootState) => state.user);

  // useEffect(() => {

  // }, [])

  return (
    <div>
      {/* <h1>Gemini-CLI</h1>
      <p>채팅 페이지로 이동하여 Gemini와 대화를 시작해보세요.</p>
      <Link to="/login">로그인</Link> */}
    </div>
  );
}

export default HomePage;
