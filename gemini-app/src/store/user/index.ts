import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  id: string;
  accessToken: string;
  refreshToken: string;
}

export const initialState: UserState = {
  id: "",
  accessToken: "",
  refreshToken: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserInfo(state, action: PayloadAction<UserState>) {
      return {
        ...state,
        ...action.payload,
      };
    },
    setInitialized(state) {
      return {
        ...state,
        id: "",
        accessToken: "",
        refreshToken: "",
      };
    },
  },
});

export const { setUserInfo, setInitialized } = userSlice.actions;
export default userSlice.reducer;
