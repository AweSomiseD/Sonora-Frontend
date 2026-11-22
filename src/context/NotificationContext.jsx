import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket.js";
import api from "../services/api.js";
import { getDashboardChildPath } from "../routes/routePaths.js";
import { useAuth } from "./AuthContext.jsx";
import { useToast } from "./ToastContext.jsx";

// Notifications + message counters for the header and sidebar badges.
const NotificationContext = createContext(null);

const EMPTY_MESSAGES = { messages: 0, conversations: 0, otherMode: null };

export const NotificationProvider = ({ children }) => {
  const { user, activeRole, isAdmin, switchRole, refreshUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [messageSummary, setMessageSummary] = useState(EMPTY_MESSAGES);
  const [pendingCounts, setPendingCounts] = useState({ artistRequests: 0, reports: 0 });

  const userId = user?._id;

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications?limit=10");
      setNotifications(data.items);
      setUnread(data.unread);
    } catch {
      // badge is not critical
    }
  }, []);

  const fetchMessageSummary = useCallback(async () => {
    if (activeRole !== "listener" && activeRole !== "artist") {
      setMessageSummary(EMPTY_MESSAGES);
      return;
    }
    try {
      const { data } = await api.get("/messages/unread-summary");
      setMessageSummary(data);
    } catch {
      // ignore
    }
  }, [activeRole]);

  // Load when the user or mode changes
  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnread(0);
      setMessageSummary(EMPTY_MESSAGES);
      return;
    }
    fetchNotifications();
    fetchMessageSummary();
  }, [userId, activeRole, fetchNotifications, fetchMessageSummary]);

  useEffect(() => {
    if (user?.pendingCounts) setPendingCounts(user.pendingCounts);
  }, [user?.pendingCounts]);

  // Live updates
  useEffect(() => {
    if (!userId) return undefined;

    const onNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev.filter((n) => n._id !== notification._id)].slice(0, 20));
      setUnread((count) => count + 1);
      showToast(notification.title, "info", notification.link ? { action: { label: "View", onClick: () => navigate(notification.link) } } : {});
    };

    const onMessage = (message) => {
      const mode = message.conversationMode;
      if (!mode || mode === activeRole) {
        fetchMessageSummary();
        return;
      }
      // Chat belongs to the other dashboard: bump that counter + offer a switch
      setMessageSummary((prev) => ({
        ...prev,
        otherMode: {
          role: mode,
          messages: (prev.otherMode?.messages || 0) + 1,
          conversations: Math.max(prev.otherMode?.conversations || 0, 1),
        },
      }));
      showToast(`New message in your ${mode === "artist" ? "Artist Studio" : "Listener Hub"} inbox`, "info", {
        action: { label: "Switch", onClick: () => switchRole(mode, { navigateTo: getDashboardChildPath(mode, "messages") }) },
      });
    };

    const onRead = () => fetchMessageSummary();
    const onPendingChanged = (counts) => setPendingCounts((prev) => ({ ...prev, ...counts }));
    const onSubscription = () => refreshUser();

    socket.on("notification:new", onNotification);
    socket.on("message:new", onMessage);
    socket.on("conversation:read", onRead);
    socket.on("subscription:updated", onSubscription);
    if (isAdmin) socket.on("admin:pending-changed", onPendingChanged);

    return () => {
      socket.off("notification:new", onNotification);
      socket.off("message:new", onMessage);
      socket.off("conversation:read", onRead);
      socket.off("subscription:updated", onSubscription);
      socket.off("admin:pending-changed", onPendingChanged);
    };
  }, [userId, activeRole, isAdmin, fetchMessageSummary, navigate, showToast, switchRole, refreshUser]);

  const markRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    try {
      const { data } = await api.patch(`/notifications/${id}/read`);
      setUnread(data.unread);
    } catch {
      // ignore
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
    try {
      await api.patch("/notifications/read-all");
    } catch {
      // ignore
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unread,
        messageSummary,
        pendingCounts,
        markRead,
        markAllRead,
        refreshNotifications: fetchNotifications,
        refreshMessages: fetchMessageSummary,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used inside NotificationProvider");
  return context;
};
