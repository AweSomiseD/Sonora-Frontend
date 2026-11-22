import { FaExchangeAlt, FaHeadphones, FaMicrophoneAlt, FaSpinner } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotifications } from "../context/NotificationContext.jsx";

// Visible only for users who are both listener and artist.
// Shows the mode you will switch TO, plus a dot when that mode has unread messages.
export default function SwitchRoleButton({ compact = false, fullWidth = false }) {
  const { canSwitch, activeRole, switchRole, switching } = useAuth();
  const { messageSummary } = useNotifications();

  if (!canSwitch || (activeRole !== "listener" && activeRole !== "artist")) return null;

  const target = activeRole === "artist" ? "listener" : "artist";
  const label = target === "artist" ? "Switch to Artist Studio" : "Switch to Listener";
  const Icon = target === "artist" ? FaMicrophoneAlt : FaHeadphones;
  const otherUnread = messageSummary?.otherMode?.role === target ? messageSummary.otherMode.conversations : 0;

  return (
    <button
      type="button"
      onClick={() => switchRole(target)}
      disabled={switching}
      aria-label={otherUnread > 0 ? `${label} (${otherUnread} unread)` : label}
      title={label}
      className={`relative inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 text-sm font-semibold text-violet-100 transition hover:border-fuchsia-400/50 hover:bg-violet-500/20 disabled:cursor-wait disabled:opacity-60 ${fullWidth ? "w-full justify-start" : ""}`}
    >
      {switching ? <FaSpinner className="animate-spin" aria-hidden="true" /> : <Icon aria-hidden="true" />}
      {!compact && <span className={fullWidth ? "" : "hidden sm:inline"}>{label}</span>}
      {compact && <FaExchangeAlt className="text-xs" aria-hidden="true" />}
      {otherUnread > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-fuchsia-500 px-1 text-[10px] font-bold text-white" aria-hidden="true">
          {otherUnread > 9 ? "9+" : otherUnread}
        </span>
      )}
    </button>
  );
}
