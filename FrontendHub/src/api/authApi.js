// src/api/authApi.js
import axiosClient from "./axiosClient";

export const authApi = {
  // login nhận 1 object { email, password }
  login: async (loginData) => {
    const res = await axiosClient.post("/auth/login", loginData);
    return res.data;
  },

  register: async (payload) => {
    const res = await axiosClient.post("/auth/register", payload);
    return res.data;
  },
};
