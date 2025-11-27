import React from "react";
import Router from "./router/router";
import "./App.css";
import { Provider, useSelector } from "react-redux";
import store, { persistor } from "./store";
import { PersistGate } from "redux-persist/integration/react";
// import TitleBar from "./components/TitleBar"; // TitleBar 컴포넌트 import
import TitleBar from "./component/TitleBar";
import { RootState } from "./store/RootReducer";

const RouterOption = () => {
  const user = useSelector((state: any) => state.user);
  // alert(JSON.stringify(user));
  return <Router user={user} />;
};

const App = () => {
  // 이 곳에서 전역 레이아웃이나 Context Provider 등을 설정할 수 있습니다.
  // const store = store();

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <TitleBar /> {/* 최상단에 TitleBar 추가 */}
        <RouterOption />
      </PersistGate>
    </Provider>
  );
};

export default App;
