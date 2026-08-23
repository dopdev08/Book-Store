// src/api/discountCodeApi.js
import axiosClient from "./axiosClient";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: token ? `Bearer ${token}` : "" };
};

export const discountCodeApi = {
  // ================= ADMIN =================
  getAll: async () =>
    (await axiosClient.get("/admin/discount-codes", { headers: authHeader() }))
      .data,

  getOne: async (id) =>
    (
      await axiosClient.get(`/admin/discount-codes/${id}`, {
        headers: authHeader(),
      })
    ).data,

  create: async (payload) =>
    (
      await axiosClient.post("/admin/discount-codes", payload, {
        headers: { ...authHeader(), "Content-Type": "application/json" },
      })
    ).data,

  update: async (id, payload) =>
    (
      await axiosClient.put(`/admin/discount-codes/${id}`, payload, {
        headers: { ...authHeader(), "Content-Type": "application/json" },
      })
    ).data,

  remove: async (id) =>
    (
      await axiosClient.delete(`/admin/discount-codes/${id}`, {
        headers: authHeader(),
      })
    ).data,

  toggleActive: async (id, active) =>
    (
      await axiosClient.put(`/admin/discount-codes/${id}/active`, null, {
        params: { active },
        headers: authHeader(),
      })
    ).data,

  // ================= USER (PUBLIC) =================

  // lấy danh sách mã công khai (backend trả tất cả public+valid)
  getPublic: async () => {
    const res = await axiosClient.get("/discount-codes/public", {
      headers: authHeader(),
    });
    return res.data;
  },

  // kiểm tra 1 mã user nhập
  check: async (code) => {
    const res = await axiosClient.get("/discount-codes/check", {
      params: { code },
      headers: authHeader(),
    });
    return res.data;
  },
};
