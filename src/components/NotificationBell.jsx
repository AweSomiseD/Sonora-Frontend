import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBell, FaCheckDouble } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotifications } from "../context/NotificationContext.jsx";
import { getDashboardChildPath } from "../routes/routePaths.js";
import { timeAgo } from "../utils/format.js";

export default function NotificationBell() {
  const { notifications, unread, markRead, markAllRead } = useNotifications();
  const { activeRole } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (event) => !ref.current?.contains(event.target) && setOpen(false);
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const openNotification = (notification) => {
    if (!notification.isRead) markRead(notification._id);
    setOpen(false);
    if (notification.link) navigate(notification.link);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={unread > 0 ? `Notifications (${unread} unread)` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="true"
        className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-gray-300 transition hover:bg-violet-500/10 hover:text-white"
      >
        <FaBell aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-fuchsia-500 px-1 text-[10px] font-bold text-white" style={{ animation: "badgePulse 2s ease-in-out infinite" }} aria-hidden="true">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="animate-fadeIn absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-violet-500/20 bg-gray-900/95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-violet-500/10 px-4 py-3">
            <h2 className="text-sm font-bold text-white">Notifications</h2>
            {unread > 0 && (
              <button type="button" onClick={markAllRead} className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-violet-300 hover:text-violet-100">
                <FaCheckDouble aria-hidden="true" /> Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-96 overflow-y-auto scrollbar-thin">
            {notifications.length === 0 && <li className="px-4 py-10 text-center text-sm text-gray-500">No notifications yet</li>}
            {notifications.map((n) => (
              <li key={n._id}>
                <button
                  type="button"
                  onClick={() => openNotification(n)}
                  className={`flex w-full cursor-pointer gap-3 px-4 py-3 text-left transition hover:bg-violet-500/10 ${n.isRead ? "opacity-70" : ""}`}
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.isRead ? "bg-transparent" : "bg-fuchsia-400"}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-white">{n.title}</span>
                    {n.body && <span className="mt-0.5 block text-xs text-gray-400">{n.body}</span>}
                    <span className="mt-1 block text-[11px] text-gray-500">{timeAgo(n.createdAt)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <Link to={getDashboardChildPath(activeRole, "notifications")} onClick={() => setOpen(false)} className="block border-t border-violet-500/10 px-4 py-3 text-center text-xs font-semibold text-violet-300 hover:bg-violet-500/10">
            See all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
