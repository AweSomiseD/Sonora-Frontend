import { createContext, useContext, useEffect, useState } from "react";
import socket from "../socket.js";
import api from "../services/api.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      // Login ke baad current user fetch karo
      await fetchCurrentUser();

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Login error:", error);

      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  // ========================================
  // Register
  // ========================================

  const register = async (username, email, password, role) => {
    try {
      const response = await api.post("/auth/register", {
        username,
        email,
        password,
        role,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Register error:", error);

      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  // ========================================
  // Get Current User
  // ========================================

  const fetchCurrentUser = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await api.get("/auth/me");
      setUser(response.data.user);
    } catch (error) {
      console.log("Authentication check failed:", error);
      if (!silent) setUser(null);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const updateUser = (updates) => {
    setUser((current) => (current ? { ...current, ...updates } : current));
  };

  // ========================================
  // Role
  // ========================================

  const role = user?.role || null;

  const isAuthenticated = !!user;

  const isArtist = user?.role === "artist";

  const isListener = user?.role === "listener";

  const isAdmin = user?.role === "admin";

  // ========================================
  // Check Authentication on App Load
  // ========================================

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // ========================================
  // Socket Connection (user ke login/logout state se juda hua)
  // ========================================

  useEffect(() => {
    if (!isAuthenticated) {
      socket.disconnect();
      return;
    }

    const handleSocketReady = () => {
      console.log("Socket is ready:", socket.id);
    };

    let isRefreshingSocketAuth = false;
    const handleSocketError = (error) => {
      console.error("Socket connection error:", error.message);

      if (
        isRefreshingSocketAuth ||
        !/authentication required|invalid or expired access token/i.test(
          error.message,
        )
      ) {
        return;
      }

      isRefreshingSocketAuth = true;
      api
        .post("/auth/refresh")
        .then(() => {
          window.dispatchEvent(new Event("auth:token-refreshed"));
        })
        .catch((refreshError) => {
          console.error(
            "Unable to refresh authentication after socket rejection:",
            refreshError,
          );
        })
        .finally(() => {
          isRefreshingSocketAuth = false;
        });
    };

    const handleTokenRefresh = () => {
      socket.disconnect();
      socket.connect();
    };

    socket.on("socket:ready", handleSocketReady);
    socket.on("connect_error", handleSocketError);
    window.addEventListener("auth:token-refreshed", handleTokenRefresh);
    socket.connect();

    return () => {
      socket.off("socket:ready", handleSocketReady);
      socket.off("connect_error", handleSocketError);
      window.removeEventListener("auth:token-refreshed", handleTokenRefresh);
      socket.disconnect();
    };
  }, [isAuthenticated]);

  // ========================================
  // Logout
  // ========================================

  const logout = async () => {
    try {
      // Logout should never trigger the expired-token refresh flow.
      await api.post("/auth/logout", null, { skipAuthRefresh: true });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      socket.disconnect();
      // Reload the public route so protected-route guards cannot redirect
      // during the state transition from authenticated to logged out.
      window.location.replace("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        isAuthenticated,
        isArtist,
        isListener,
        isAdmin,
        login,
        register,
        logout,
        fetchCurrentUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ========================================
// Custom Hook
// ========================================

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
