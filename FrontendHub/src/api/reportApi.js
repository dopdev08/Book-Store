// src/api/reportApi.js
import axiosClient from "./axiosClient";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return { Authorization: token ? `Bearer ${token}` : "" };
};

// Helper: build params rỗng thì không gửi
const buildParams = (obj) => {
  const params = {};
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params[k] = v;
  });
  return params;
};

export const reportApi = {
  // ✅ Summary (tổng quan)
  getSummary: async ({ from, to } = {}) => {
    const res = await axiosClient.get("/admin/reports/summary", {
      headers: authHeader(),
      params: buildParams({ from, to }),
    });
    return res.data;
  },

  // ✅ Đếm đơn theo trạng thái
  getOrderStatus: async ({ from, to } = {}) => {
    const res = await axiosClient.get("/admin/reports/order-status", {
      headers: authHeader(),
      params: buildParams({ from, to }),
    });
    return res.data;
  },

  // ✅ Doanh thu theo ngày
  getRevenueDaily: async ({ from, to } = {}) => {
    const res = await axiosClient.get("/admin/reports/revenue-daily", {
      headers: authHeader(),
      params: buildParams({ from, to }),
    });
    return res.data;
  },

  // ✅ Top truyện bán chạy
  getTopComics: async ({ from, to, limit = 10 } = {}) => {
    const res = await axiosClient.get("/admin/reports/top-comics", {
      headers: authHeader(),
      params: buildParams({ from, to, limit }),
    });
    return res.data;
  },
};
