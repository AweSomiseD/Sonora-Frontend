import { NavLink } from "react-router-dom";
import {
  FaChartBar,
  FaChartLine,
  FaClipboardList,
  FaCloudUploadAlt,
  FaComments,
  FaCompass,
  FaCompactDisc,
  FaCog,
  FaCrown,
  FaFlag,
  FaHeart,
  FaHistory,
  FaHome,
  FaListUl,
  FaMicrophone,
  FaMusic,
  FaPlus,
  FaShieldAlt,
  FaSignOutAlt,
  FaStar,
  FaUser,
  FaUserCheck,
  FaUserFriends,
  FaUsers,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotifications } from "../context/NotificationContext.jsx";
import { getDashboardChildPath, getDashboardPath } from "../routes/routePaths.js";
import SwitchRoleButton from "./SwitchRoleButton.jsx";

const NAV = {
  listener: [
    { section: "Listen" },
    { to: "", label: "Home", icon: FaHome, end: true },
    { to: "discover", label: "Discover", icon: FaCompass },
    { to: "album", label: "Albums", icon: FaCompactDisc },
    { to: "artists", label: "Artists", icon: FaMicrophone },
    { section: "Your library" },
    { to: "playlists", label: "Playlists", icon: FaListUl },
    { to: "liked-songs", label: "Liked Songs", icon: FaHeart },
    { to: "recently-played", label: "Recently Played", icon: FaHistory },
    { to: "following", label: "Following", icon: FaUserFriends },
    { to: "stats", label: "Your Stats", icon: FaChartLine },
    { section: "Connect" },
    { to: "messages", label: "Messages", icon: FaComments, badge: "messages" },
    { to: "become-artist", label: "Become an Artist", icon: FaStar, hideForArtists: true },
    { to: "pricing", label: "Premium", icon: FaCrown },
  ],
  artist: [
    { section: "Studio" },
    { to: "", label: "Studio Home", icon: FaHome, end: true },
    { to: "my-music", label: "My Music", icon: FaMusic },
    { to: "my-albums", label: "My Albums", icon: FaCompactDisc },
    { to: "upload-music", label: "Upload Music", icon: FaCloudUploadAlt },
    { to: "create-album", label: "Create Album", icon: FaPlus },
    { to: "analytics", label: "Analytics", icon: FaChartLine },
    { section: "Connect" },
    { to: "messages", label: "Messages", icon: FaComments, badge: "messages" },
    { to: "pricing", label: "Premium", icon: FaCrown },
  ],
  admin: [
    { section: "Admin" },
    { to: "", label: "Overview", icon: FaHome, end: true },
    { to: "users", label: "Users", icon: FaUsers },
    { to: "artist-requests", label: "Artist Requests", icon: FaUserCheck, badge: "artistRequests" },
    { to: "reports", label: "Reports", icon: FaFlag, badge: "reports" },
    { to: "content", label: "Moderation", icon: FaShieldAlt },
    { to: "stats", label: "Stats", icon: FaChartBar },
    { to: "audit-log", label: "Audit Log", icon: FaClipboardList },
  ],
};

const linkClass = ({ isActive }) =>
  `group relative flex min-h-10 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
    isActive
      ? "nav-active-indicator bg-linear-to-r from-violet-500/20 to-fuchsia-500/10 text-violet-200 shadow-[inset_0_0_20px_rgba(139,92,246,0.1)]"
      : "text-gray-400 hover:bg-violet-500/5 hover:text-violet-100"
  }`;

export default function SidebarNav({ onNavigate, onLogout, showRoleSwitch = false }) {
  const { activeRole, hasArtistRole } = useAuth();
  const { messageSummary, pendingCounts } = useNotifications();

  const counts = {
    messages: messageSummary?.conversations || 0,
    artistRequests: pendingCounts?.artistRequests || 0,
    reports: pendingCounts?.reports || 0,
  };

  const items = (NAV[activeRole] || NAV.listener).filter((item) => !(item.hideForArtists && hasArtistRole));

  return (
    <nav className="flex flex-1 flex-col overflow-y-auto scrollbar-thin" aria-label="Main">
      {showRoleSwitch && (
        <div className="mb-4 border-b border-violet-500/10 pb-4">
          <SwitchRoleButton fullWidth />
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        {items.map((item) =>
          item.section ? (
            <p key={item.section} className="mt-4 px-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500 first:mt-0">
              {item.section}
            </p>
          ) : (
            <NavLink
              key={item.to}
              to={item.to ? getDashboardChildPath(activeRole, item.to) : getDashboardPath(activeRole)}
              end={item.end}
              className={linkClass}
              onClick={onNavigate}
            >
              <item.icon className="text-base" aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              {item.badge && counts[item.badge] > 0 && (
                <span
                  className="flex h-5 min-w-5 items-center justify-center rounded-full bg-linear-to-r from-red-500 to-rose-500 px-1.5 text-xs font-bold text-white"
                  style={{ animation: "badgePulse 2s ease-in-out infinite" }}
                  aria-label={`${counts[item.badge]} new`}
                >
                  {counts[item.badge] > 9 ? "9+" : counts[item.badge]}
                </span>
              )}
            </NavLink>
          ),
        )}
      </div>

      <div className="mt-6 flex flex-col gap-0.5 border-t border-violet-500/10 pt-4">
        <NavLink to={getDashboardChildPath(activeRole, "profile")} className={linkClass} onClick={onNavigate}>
          <FaUser className="text-base" aria-hidden="true" /> Profile
        </NavLink>
        <NavLink to={getDashboardChildPath(activeRole, "settings")} className={linkClass} onClick={onNavigate}>
          <FaCog className="text-base" aria-hidden="true" /> Settings
        </NavLink>
        <button
          type="button"
          onClick={onLogout}
          className="mt-3 flex min-h-10 cursor-pointer items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 text-sm font-medium text-red-300 transition hover:border-red-500/40 hover:bg-red-500/10"
        >
          <FaSignOutAlt aria-hidden="true" /> Logout
        </button>
      </div>
    </nav>
  );
}
