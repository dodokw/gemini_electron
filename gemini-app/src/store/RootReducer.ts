import { combineReducers, AnyAction, Reducer } from "@reduxjs/toolkit";
import user from "./user";

const appReducer = combineReducers({ user });

export type RootState = ReturnType<typeof appReducer>;

const rootReducer: Reducer = (state: RootState, action: AnyAction) => {
  return appReducer(state, action);
};

export default rootReducer;
