import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// Attach JWT to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hdpg_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("hdpg_token");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default api;
