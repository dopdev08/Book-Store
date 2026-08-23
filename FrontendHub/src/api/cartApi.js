// src/api/cartApi.js
import axiosClient from "./axiosClient";

export const cartApi = {
  // Lấy toàn bộ giỏ hàng của user hiện tại
  getCart: async () => {
    const token = localStorage.getItem("token");
    const res = await axiosClient.get("/cart", {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return res.data; // List<CartItem>
  },

  // Thêm comic vào giỏ
  addToCart: async (comicId, quantity = 1) => {
    const token = localStorage.getItem("token");
    const res = await axiosClient.post(
      "/cart/add",
      { comicId, quantity }, // CartItemRequest
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      }
    );
    return res.data; // CartItem
  },

  // Cập nhật số lượng theo cartItemId
  updateQuantity: async (cartItemId, quantity) => {
    const token = localStorage.getItem("token");
    const res = await axiosClient.put(
      `/cart/${cartItemId}`,
      null,
      {
        params: { quantity },
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return res.data;
  },

  // Xóa 1 item khỏi giỏ
  removeItem: async (cartItemId) => {
    const token = localStorage.getItem("token");
    const res = await axiosClient.delete(`/cart/${cartItemId}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return res.data;
  },

  // Xóa toàn bộ giỏ
  clearCart: async () => {
    const token = localStorage.getItem("token");
    const res = await axiosClient.delete("/cart/clear", {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return res.data;
  },
};
