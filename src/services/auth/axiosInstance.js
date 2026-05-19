import axios from "axios";
import { getToken, saveToken, logoutUser, navigateTo } from "./authHelpers";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: BASE_URL,
  // Required because the backend issues refresh tokens via httpOnly cookies.
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh-in-flight handling: only one /auth/refresh request can run at a time,
// concurrent 401-failed requests subscribe to the same refresh promise.
let isRefreshing = false;
let pendingQueue = [];

const flushQueue = (error, newToken = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(newToken);
  });
  pendingQueue = [];
};

const REFRESH_URL = "/auth/refresh";
const LOGIN_URL = "/auth/login";
const REGISTER_URL = "/auth/register";
const GOOGLE_URL = "/auth/google";

const shouldSkipRefresh = (url) =>
  !!url &&
  (url.includes(REFRESH_URL) ||
    url.includes(LOGIN_URL) ||
    url.includes(REGISTER_URL) ||
    url.includes(GOOGLE_URL));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      shouldSkipRefresh(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (newToken) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            originalRequest._retry = true;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await api.post(REFRESH_URL);
      const newToken = data?.accessToken;
      if (!newToken) throw new Error("Refresh failed: missing token");

      saveToken(newToken);
      flushQueue(null, newToken);

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      logoutUser();
      // Only redirect from non-public pages so we don't bounce a visitor
      // who just happens to fail a background `/me` call on the landing page.
      const path = window.location.pathname;
      const publicPaths = ["/", "/login", "/get-started", "/forgot-password", "/reset-password", "/verify-email"];
      if (!publicPaths.includes(path)) {
        navigateTo("/login");
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
