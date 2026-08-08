import axios from "axios";

// In dev, Vite proxies "/api" to localhost:5000 (see vite.config.js).
// In production (e.g. Render), the frontend and backend are separate
// origins, so VITE_API_URL must be set to the backend's full URL
// (e.g. https://jalrakshak-api.onrender.com/api) at build time.
const baseURL = import.meta.env.VITE_API_URL || "/api";

const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("jr_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let pendingQueue = [];

const flushQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  pendingQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") || originalRequest?.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      const refreshToken = localStorage.getItem("jr_refresh_token");
      if (!refreshToken) {
        localStorage.removeItem("jr_access_token");
        localStorage.removeItem("jr_refresh_token");
        localStorage.removeItem("jr_user");
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request until the in-flight refresh resolves
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
        localStorage.setItem("jr_access_token", data.accessToken);
        localStorage.setItem("jr_refresh_token", data.refreshToken);
        flushQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError, null);
        localStorage.removeItem("jr_access_token");
        localStorage.removeItem("jr_refresh_token");
        localStorage.removeItem("jr_user");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
