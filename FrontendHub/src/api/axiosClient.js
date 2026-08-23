import axios from "axios";

const base = import.meta.env.VITE_API_URL;
console.log("VITE_API_URL =", base);

const axiosClient = axios.create({
  baseURL: base ? `${base}/api` : "http://localhost:8080/api",
  // headers: { "Content-Type": "application/json" },
});
export default axiosClient;
