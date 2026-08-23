// src/api/orderApi.js
import axiosClient from "./axiosClient";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const orderApi = {
  // 🔹 Tạo order từ giỏ hàng (COD / Momo / VNPay...)
  // payload = OrderRequest từ frontend
  createOrder: async (payload) => {
    const res = await axiosClient.post("/orders", payload, {
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
    });
    return res.data; // Order
  },

  // 🔹 User: lấy danh sách đơn hàng của chính mình
  getMyOrders: async () => {
    const res = await axiosClient.get("/orders/my", {
      headers: authHeader(),
    });
    return res.data;
  },

  // 🔹 Admin: lấy tất cả đơn
  getAllOrdersAdmin: async () => {
    const res = await axiosClient.get("/orders/admin", {
      headers: authHeader(),
    });
    return res.data;
  },

  // 🔹 Admin: cập nhật trạng thái đơn
  updateOrderStatus: async (orderId, status) => {
    const res = await axiosClient.put(
      `/orders/${orderId}/status`,
      null,
      {
        params: { status }, // PENDING, PAID, CANCELLED...
        headers: authHeader(),
      }
    );
    return res.data;
  },
};
