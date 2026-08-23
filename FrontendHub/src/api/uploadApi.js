// src/api/uploadApi.js
import axiosClient from "./axiosClient";

export const uploadApi = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("file", file); // trùng @RequestParam("file")

    const token = localStorage.getItem("token");

    const res = await axiosClient.post(
      "/upload/image",
      formData,
      {
        headers: {
          // KHÔNG set Content-Type (axios tự set multipart/form-data + boundary)
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    return res.data; // { url, message }
  },
  uploadPreview: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("token");

    const res = await axiosClient.post("/upload/preview", formData, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    return res.data; // { url, message }
  },
};
