import api from "./api.js";

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    if (originalRequest?.skipAuthRefresh) {
      return Promise.reject(error);
    }

    // Sirf 401 errors handle karo
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Refresh endpoint khud fail ho raha hai to loop mat banao
    if (originalRequest?.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    // Same request ko dobara refresh loop mein mat bhejo
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // Agar already koi refresh request chal rahi hai
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(() => {
          api(originalRequest).then(resolve).catch(reject);
        });
      });
    }

    // First request refresh karegi
    isRefreshing = true;

    try {
      await api.post("/auth/refresh");

      isRefreshing = false;

      // Waiting requests ko release karo
      onTokenRefreshed();
      window.dispatchEvent(new Event("auth:token-refreshed"));

      // Original request dobara bhejo
      return api(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      refreshSubscribers = [];

      console.error("Refresh token failed:", refreshError);

      // Session completely expired
      // Sirf tab redirect karo jab already login page pe na ho —
      // warna reload loop ban jaata hai (login page → 401 → refresh fail → reload → repeat)
      const publicPaths = ["/login", "/register", "/", "/about"];
      const isPublicPath =
        publicPaths.includes(window.location.pathname) ||
        window.location.pathname.startsWith("/reset-password/");
      if (!isPublicPath) {
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    }
  },
);

export default api;
