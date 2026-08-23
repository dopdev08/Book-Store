// src/api/comicApi.js
import axiosClient from "./axiosClient";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const comicApi = {
  // ================= USER (PUBLIC) =================
  // backend đã lọc active=true
  getAll: async () => {
    const res = await axiosClient.get("/comics");
    return res.data;
  },

  getOne: async (id) => {
    const res = await axiosClient.get(`/comics/${id}`);
    return res.data;
  },

  // ================= ADMIN =================
  // xem tất cả (active + inactive)
  getAllAdmin: async () => {
    const res = await axiosClient.get("/comics/admin/all", {
      headers: authHeader(),
    });
    return res.data;
  },

  create: async (comic) => {
    const res = await axiosClient.post("/comics", comic, {
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
    });
    return res.data;
  },

  update: async (id, comic) => {
    const res = await axiosClient.put(`/comics/${id}`, comic, {
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
    });
    return res.data;
  },

  // bật / tắt mở bán
  setActive: async (id, active) => {
    const res = await axiosClient.put(
      `/comics/${id}/active`,
      null,
      {
        params: { active }, // true | false
        headers: authHeader(),
      }
    );
    return res.data;
  },
  updatePreviewUrl: async (id, previewUrl) => {
    const res = await axiosClient.put(
      `/comics/${id}/preview`,
      { previewUrl },
      {
        headers: {
          ...authHeader(),
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  },
};
