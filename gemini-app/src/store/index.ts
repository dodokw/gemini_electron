import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import rootReducer from "./RootReducer";
import storage from "redux-persist/lib/storage";

// localStorage를 redux-persist가 기대하는 비동기 형식으로 래핑
const createAsyncLocalStorage = () => {
  return {
    getItem: (key: string): Promise<string | null> => {
      return Promise.resolve(localStorage.getItem(key));
    },
    setItem: (key: string, value: string): Promise<void> => {
      return Promise.resolve(localStorage.setItem(key, value));
    },
    removeItem: (key: string): Promise<void> => {
      return Promise.resolve(localStorage.removeItem(key));
    },
  };
};

const persistConfig = {
  key: "root",
  storage: createAsyncLocalStorage(),
  // storage,
  timeout: 0,
  whitelist: ["user"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;

export const persistor = persistStore(store);
