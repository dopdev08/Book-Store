// src/api/userApi.js
import axiosClient from "./axiosClient";

export const userApi = {
  // Lấy thông tin user hiện tại (/api/users/me)
  getMe: async () => {
    const token = localStorage.getItem("token");
    const res = await axiosClient.get("/users/me", {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return res.data;
  },

  // Cập nhật fullName, phone, address
  updateMe: async (payload) => {
    const token = localStorage.getItem("token");
    const res = await axiosClient.put("/users/me", payload, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });
    return res.data;
  },

  // phân trang comics (giữ đúng logic bạn đang có)
  getPage: async ({ page = 0, size = 12, q = "", category = "ALL" }) => {
    const res = await axiosClient.get("/comics/page", {
      params: { page, size, q, category },
    });
    return res.data;
  },

  // đổi mật khẩu
  changePassword: async (payload) => {
    const token = localStorage.getItem("token");
    const res = await axiosClient.put("/users/me/change-password", payload, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });
    return res.data;
  },
};
