import axios, { AxiosInstance } from "axios";
import store from "../store";
import { setInitialized, setUserInfo } from "../store/user";

export const baseURL = "http://localhost:8000/api/";

const RefreshToken = async () => {
  try {
    const res = await axios.post<any>(baseURL + "users/refresh-token", {
      id: store.getState().user.id,
      refresh_token: store.getState().user.refreshToken,
    });
    return res.data.data.body;
  } catch (e) {
    console.warn(e);
  }
};

const axiosInstance: AxiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

//create req intercepter
axiosInstance.interceptors.request.use(
  async (config) => {
    const accessToken = store.getState().user.accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//create res intercepter
axiosInstance.interceptors.response.use(
  (response) => {
    // return response;
    if (response.status === 401) {
      RefreshToken()
        .then((res) => {
          console.log("refreshToken", res?.data);
          store.dispatch(
            setUserInfo({
              accessToken: res?.access_token,
              refreshToken: res?.refresh_token,
              id: res?.id,
            })
          );
        })
        .catch((e) => {
          store.dispatch(setInitialized());
        });
    }
    return response;
  },
  (error) => {
    // const originalRequest = error.config;
    console.error("error", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
