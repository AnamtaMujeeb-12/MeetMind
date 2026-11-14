import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.PROD ? "https://meetmind-f4yz.onrender.com" : "http://localhost:5000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("meetmind_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default api;
