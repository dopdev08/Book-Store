// src/api/reviewApi.js
import axiosClient from "./axiosClient";

export const reviewApi = {
  // Lấy review theo comic
  getByComic: async (comicId) => {
    const token = localStorage.getItem("token");
    const res = await axiosClient.get(`/reviews/comic/${comicId}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return res.data; // ReviewResponse[]
  },

  // Tạo / cập nhật đánh giá
  createOrUpdate: async ({ comicId, rating, comment }) => {
    const token = localStorage.getItem("token");
    const res = await axiosClient.post(
      "/reviews",
      { comicId, rating, comment },
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
      }
    );
    return res.data; // ReviewResponse
  },

  // Lấy review của chính mình
  getMyReviews: async () => {
    const token = localStorage.getItem("token");
    const res = await axiosClient.get("/reviews/my", {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return res.data;
  },

  // Xóa review
  deleteReview: async (reviewId) => {
    const token = localStorage.getItem("token");
    const res = await axiosClient.delete(`/reviews/${reviewId}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return res.data;
  },

  // Admin: lấy tất cả review
  getAllAdmin: async () => {
    const token = localStorage.getItem("token");
    const res = await axiosClient.get("/reviews/admin/all", {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return res.data;
  },
};
