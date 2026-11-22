import api from "./api.js";

// Handles expired access tokens (refresh + retry) and turns special
// API error codes into window events the app listens to:
//   auth:token-refreshed   -> socket reconnects, user is re-fetched
//   auth:session-expired   -> go to login
//   auth:banned            -> banned screen with the reason
//   auth:role-revoked      -> switch to listener mode automatically
//   plan:limit             -> upgrade modal

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => refreshSubscribers.push(callback);
const flushSubscribers = (error) => {
  refreshSubscribers.forEach((callback) => callback(error));
  refreshSubscribers = [];
};

const NO_REFRESH_URLS = ["/auth/refresh", "/auth/login", "/auth/register", "/auth/logout"];
const PUBLIC_PATHS = ["/", "/login", "/register", "/about", "/forgot-password", "/choose-role"];

const isPublicPath = () =>
  PUBLIC_PATHS.includes(window.location.pathname) ||
  window.location.pathname.startsWith("/reset-password/") ||
  window.location.pathname.startsWith("/verify-email/");

const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    const data = error.response?.data || {};

    if (originalRequest.skipAuthRefresh) return Promise.reject(error);

    if (data.code === "ACCOUNT_BANNED") {
      emit("auth:banned", { reason: data.reason || null, message: data.message });
      return Promise.reject(error);
    }

    if (data.code === "ARTIST_REVOKED" || data.code === "ROLE_NOT_ALLOWED") {
      if (data.code === "ARTIST_REVOKED") emit("auth:role-revoked", { role: "artist" });
      return Promise.reject(error);
    }

    if (data.code === "PLAN_LIMIT") {
      emit("plan:limit", data);
      return Promise.reject(error);
    }

    if (status !== 401) return Promise.reject(error);
    if (NO_REFRESH_URLS.some((url) => originalRequest.url?.includes(url))) return Promise.reject(error);
    if (originalRequest._retry) return Promise.reject(error);
    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((refreshError) => {
          if (refreshError) reject(refreshError);
          else api(originalRequest).then(resolve).catch(reject);
        });
      });
    }

    isRefreshing = true;
    try {
      await api.post("/auth/refresh");
      isRefreshing = false;
      flushSubscribers(null);
      emit("auth:token-refreshed");
      return api(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      flushSubscribers(refreshError);

      const code = refreshError?.response?.data?.code;
      if (code === "ACCOUNT_BANNED") {
        emit("auth:banned", { reason: refreshError.response.data.reason || null });
      } else {
        emit("auth:session-expired", { code });
        // Avoid reload loops on public pages
        if (!isPublicPath()) {
          window.location.href = `/login?session=expired`;
        }
      }
      return Promise.reject(refreshError);
    }
  },
);

export default api;
