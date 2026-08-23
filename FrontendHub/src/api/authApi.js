// src/api/authApi.js
import axiosClient from "./axiosClient";

export const authApi = {
  // login nhận 1 object { email, password }
  login: async (loginData) => {
    const res = await axiosClient.post("/auth/login", loginData);

    const data = res.data;
    // lưu token + roles
    localStorage.setItem("token", data.token);
    localStorage.setItem("userRoles", JSON.stringify(data.roles));

    return data;
  },

  register: async (payload) => {
    const res = await axiosClient.post("/auth/register", payload);
    return res.data;
  },
};
