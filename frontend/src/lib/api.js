// frontend/src/lib/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  withCredentials: true,
  timeout: 15000,
});

// --- auth header 注入
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- 401 → ログインへ
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      // トークン破棄→ログインへ
      localStorage.removeItem("token");
      if (!location.pathname.startsWith("/store-auth"))
        location.href = "/store-auth/login";
    }
    return Promise.reject(err);
  }
);

export default api;
