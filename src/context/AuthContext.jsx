import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket.js";
import api, { getErrorCode, getErrorMessage } from "../services/api.js";
import { getDashboardPath } from "../routes/routePaths.js";
import { useToast } from "./ToastContext.jsx";

const AuthContext = createContext(null);

const MODE_NAMES = {
  artist: "Artist Studio",
  listener: "Listener Hub",
  admin: "Admin Console",
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [banned, setBanned] = useState(null); // { reason } when the account is banned
  const [switching, setSwitching] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const switchingRef = useRef(false);
  const lastRevokeRef = useRef(0);

  // ===== Current user =====
  const fetchCurrentUser = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await api.get("/auth/me");
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      if (!silent || error.response?.status === 401) setUser(null);
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(
    () => fetchCurrentUser(true),
    [fetchCurrentUser],
  );

  const updateUser = useCallback((updates) => {
    setUser((current) => (current ? { ...current, ...updates } : current));
  }, []);

  // ===== Login / register =====
  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      setBanned(null);
      setUser(response.data.user);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        code: getErrorCode(error),
        message: getErrorMessage(error, "Login failed"),
        data: error.response?.data,
      };
    }
  };

  const register = async (
    username,
    email,
    password,
    wantsToBeArtist = false,
  ) => {
    try {
      const response = await api.post("/auth/register", {
        username,
        email,
        password,
        wantsToBeArtist,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        code: getErrorCode(error),
        message: getErrorMessage(error, "Registration failed"),
        errors: error.response?.data?.errors || [],
      };
    }
  };

  // ===== Roles =====
  const roles = useMemo(
    () => user?.roles || (user?.role ? [user.role] : []),
    [user],
  );
  const activeRole = user?.activeRole || user?.role || null;
  const canSwitch = roles.includes("listener") && roles.includes("artist");

  const switchRole = useCallback(
    async (role, { silent = false, navigateTo } = {}) => {
      if (switchingRef.current) return false;
      switchingRef.current = true;
      setSwitching(true);
      try {
        const response = await api.post("/auth/switch-role", { role });
        setUser(response.data.user);
        // New access token: reconnect the socket with the new active role
        window.dispatchEvent(new Event("auth:token-refreshed"));
        navigate(navigateTo || getDashboardPath(role));
        if (!silent)
          showToast(`Switched to ${MODE_NAMES[role] || role}`, "success");
        return true;
      } catch (error) {
        showToast(getErrorMessage(error, "Could not switch mode"), "error");
        return false;
      } finally {
        switchingRef.current = false;
        setSwitching(false);
      }
    },
    [navigate, showToast],
  );

  // The API and the socket can both report a revoke: handle it once
  const handleArtistRevoked = useCallback(() => {
    if (Date.now() - lastRevokeRef.current < 5000) return;
    lastRevokeRef.current = Date.now();
    showToast(
      "Your artist access was removed. You are now in listener mode.",
      "warning",
    );
    switchRole("listener", { silent: true });
  }, [showToast, switchRole]);

  // ===== Load on start ===== bad main change kar dena
  // useEffect(() => {
  //   fetchCurrentUser();
  // }, [fetchCurrentUser]);

  // ==== Global auth events from the API interceptor =====
  useEffect(() => {
    if (import.meta.env.VITE_PUBLIC_LANDING_ONLY === "true") {
      setLoading(false);
      return;
    }

    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // ===== Global auth events from the API interceptor =====
  useEffect(() => {
    const onBanned = (event) => {
      setBanned({ reason: event.detail?.reason || null });
      socket.disconnect();
    };
    const onRoleRevoked = () => handleArtistRevoked();
    const onRefreshed = () => refreshUser();

    window.addEventListener("auth:banned", onBanned);
    window.addEventListener("auth:role-revoked", onRoleRevoked);
    window.addEventListener("auth:token-refreshed", onRefreshed);
    return () => {
      window.removeEventListener("auth:banned", onBanned);
      window.removeEventListener("auth:role-revoked", onRoleRevoked);
      window.removeEventListener("auth:token-refreshed", onRefreshed);
    };
  }, [refreshUser, handleArtistRevoked]);

  // ===== Socket connection follows the login state =====
  const isAuthenticated = Boolean(user);

  useEffect(() => {
    if (!isAuthenticated) {
      socket.disconnect();
      return undefined;
    }

    let refreshingSocketAuth = false;
    const handleSocketError = (error) => {
      if (/account banned/i.test(error.message)) {
        setBanned({ reason: null });
        return;
      }
      if (
        refreshingSocketAuth ||
        !/authentication required|invalid or expired access token/i.test(
          error.message,
        )
      )
        return;
      refreshingSocketAuth = true;
      api
        .post("/auth/refresh")
        .then(() => window.dispatchEvent(new Event("auth:token-refreshed")))
        .catch(() => {})
        .finally(() => {
          refreshingSocketAuth = false;
        });
    };

    const handleTokenRefresh = () => {
      socket.disconnect();
      socket.connect();
    };

    // Live role changes pushed by the server (approve / revoke / admin change)
    const onRoleUpdated = (payload) => {
      refreshUser();
      if (
        payload?.reason === "artist_approved" ||
        payload?.reason === "artist_restored"
      ) {
        showToast(
          "You are now an artist! Use the switch button to open Artist Studio.",
          "success",
          {
            action: { label: "Switch", onClick: () => switchRole("artist") },
          },
        );
      }
    };
    const onRoleRevoked = () => handleArtistRevoked();
    const onSessionChanged = () => {
      showToast("Your account was updated. Please log in again.", "info");
      setTimeout(() => window.location.replace("/login"), 1500);
    };

    socket.on("connect_error", handleSocketError);
    socket.on("role:updated", onRoleUpdated);
    socket.on("role:revoked", onRoleRevoked);
    socket.on("session:changed", onSessionChanged);
    window.addEventListener("auth:token-refreshed", handleTokenRefresh);
    socket.connect();

    return () => {
      socket.off("connect_error", handleSocketError);
      socket.off("role:updated", onRoleUpdated);
      socket.off("role:revoked", onRoleRevoked);
      socket.off("session:changed", onSessionChanged);
      window.removeEventListener("auth:token-refreshed", handleTokenRefresh);
      socket.disconnect();
    };
  }, [
    isAuthenticated,
    refreshUser,
    showToast,
    switchRole,
    handleArtistRevoked,
  ]);

  // ===== Logout =====
  const logout = async () => {
    try {
      await api.post("/auth/logout", null, { skipAuthRefresh: true });
    } catch {
      // ignore network errors on logout
    } finally {
      socket.disconnect();
      // Full reload: clears every in-memory state (player, caches)
      window.location.replace("/");
    }
  };

  const logoutAll = async () => {
    try {
      await api.post("/auth/logout-all", null, { skipAuthRefresh: true });
    } finally {
      socket.disconnect();
      window.location.replace("/login");
    }
  };

  const value = {
    user,
    role: activeRole,
    activeRole,
    roles,
    canSwitch,
    switching,
    loading,
    banned,
    isAuthenticated,
    isArtist: activeRole === "artist",
    isListener: activeRole === "listener",
    isAdmin: activeRole === "admin",
    hasArtistRole: roles.includes("artist"),
    artistRequest: user?.artistRequest || null,
    login,
    register,
    logout,
    logoutAll,
    switchRole,
    fetchCurrentUser,
    refreshUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
