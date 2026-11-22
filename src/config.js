// URLs come from Vite env variables (see .env.example).
const stripSlash = (url) => url.replace(/\/+$/, "");

export const API_URL = stripSlash(import.meta.env.VITE_API_URL || "http://localhost:3000/api");

// Socket.IO server: VITE_SOCKET_URL, or the API URL without "/api"
export const SOCKET_URL = stripSlash(
  import.meta.env.VITE_SOCKET_URL || API_URL.replace(/\/api$/, ""),
);

export const GOOGLE_AUTH_URL = `${API_URL}/auth/google`;
