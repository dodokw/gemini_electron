import React from "react";
import axios from "axios";
import { baseURL } from "../axiosConfig";
import { loginDto } from "./type";

type response = {
  data: {
    body: {
      code: string;
      message: string;
      id: string;
      access_token: string;
      refresh_token: string;
    };
  };
};

export const regist = async ({
  id,
  password,
  PCUUID,
  mobileUUID,
}: loginDto) => {
  try {
    const res = await axios.post<response>(baseURL + "users/regist", {
      id,
      password,
      PCUUID,
      mobileUUID,
    });
    return res.data.data.body;
  } catch (e) {
    console.error(e);
  }
};
