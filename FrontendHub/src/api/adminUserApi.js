// src/api/adminUserApi.js
import axiosClient from "./axiosClient";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const adminUserApi = {
  // Lấy danh sách tất cả user
  getAllUsers: async () => {
    const res = await axiosClient.get("/admin/users", {
      headers: authHeader(),
    });
    return res.data; // List<AdminUserResponse>
  },

  // Khóa / mở khóa tài khoản
  setUserActive: async (userId, active) => {
    const res = await axiosClient.put(
      `/admin/users/${userId}/active`,
      null,
      {
        params: { active }, // ?active=true/false
        headers: authHeader(),
      }
    );
    return res.data; // message
  },

  // Xem các đơn hàng của 1 user
  getUserOrders: async (userId) => {
    const res = await axiosClient.get(
      `/admin/users/${userId}/orders`,
      {
        headers: authHeader(),
      }
    );
    return res.data; // List<Order>
  },
};
