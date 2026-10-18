import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  FaHome,
  FaCompass,
  FaCompactDisc,
  FaMusic,
  FaCloudUploadAlt,
  FaPlus,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaUsers,
  FaHeart,
  FaHistory,
  FaUserFriends,
  FaMicrophone,
  FaShieldAlt,
  FaChartBar,
  FaComments,
  FaCrown,
} from "react-icons/fa";

import LogoutModal from "./LogoutModel.jsx";
import { useAuth } from "../context/AuthContext";
import {
  getDashboardChildPath,
  getDashboardPath,
} from "../routes/routePaths.js";
import api from "../services/api.js";

export const DashboardLayout = () => {
  const { user, isArtist, logout, isListener, isAdmin } = useAuth();
  const [unreadConversations, setUnreadConversations] = useState(0);
  useEffect(() => {
    if (!user || (!isListener && !isArtist)) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await api.get("/messages/unread-summary");

        setUnreadConversations(response.data.conversations || 0);
      } catch (error) {
        console.error("Failed to fetch unread conversations:", error);
      }
    };

    fetchUnreadCount();
  }, [user, isListener, isArtist]);
  const dashboardPath = getDashboardPath(user?.role);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const handleLogout = async () => {
    setIsLogoutModalOpen(false);
    await logout();
  };

  const linkClass = ({ isActive }) =>
    `group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
      isActive
        ? "bg-gradient-to-r from-violet-500/20 to-fuchsia-500/10 text-violet-300 shadow-[inset_0_0_20px_rgba(139,92,246,0.1)]"
        : "text-gray-400 hover:bg-violet-500/5 hover:text-violet-200"
    }`;

  return (
    <div className="relative flex min-h-screen bg-gray-950 text-white">
      {/* Keyframes */}
      <style>{`
        @keyframes sidebarOrb {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.15); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 8px rgba(239, 68, 68, 0.5); }
          50% { box-shadow: 0 0 16px rgba(239, 68, 68, 0.8); }
        }
        @keyframes logoGlow {
          0%, 100% { box-shadow: 0 0 10px rgba(139, 92, 246, 0.4); }
          50% { box-shadow: 0 0 22px rgba(139, 92, 246, 0.8); }
        }
        .nav-active-indicator::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 60%;
          width: 3px;
          border-radius: 0 4px 4px 0;
          background: linear-gradient(180deg, #8b5cf6, #d946ef);
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.8);
        }
      `}</style>

      {/* ========================================
          Ambient background glow (behind everything)
      ======================================== */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 animate-pulse rounded-full bg-violet-500/10 blur-[120px]" />
        <div
          className="absolute -bottom-40 left-1/4 h-96 w-96 animate-pulse rounded-full bg-fuchsia-600/8 blur-[120px]"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* ========================================
          Sidebar
      ======================================== */}

      <aside className="relative z-10 flex w-64 shrink-0 flex-col border-r border-violet-500/10 bg-gray-900/60 p-5 backdrop-blur-xl">
        {/* Sidebar internal glow orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -left-20 top-20 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl"
            style={{ animation: "sidebarOrb 6s ease-in-out infinite" }}
          />
          <div
            className="absolute -right-20 bottom-40 h-40 w-40 rounded-full bg-fuchsia-500/8 blur-3xl"
            style={{
              animation: "sidebarOrb 8s ease-in-out infinite",
              animationDelay: "2s",
            }}
          />
        </div>

        {/* Logo */}
        <NavLink
          to="/"
          className="group relative mb-8 flex items-center gap-2.5 text-xl font-black tracking-tight"
        >
          <span
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white"
            style={{ animation: "logoGlow 3s ease-in-out infinite" }}
          >
            S
          </span>
          <span
            className="bg-linear-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-transparent transition-all duration-300 group-hover:from-violet-200 group-hover:via-fuchsia-200 group-hover:to-purple-200"
            style={{
              backgroundSize: "200% auto",
              animation: "gradientShift 4s ease infinite",
            }}
          >
            Sonora
          </span>
        </NavLink>

        <nav className="relative flex flex-1 flex-col gap-1 overflow-y-auto scrollbar-thin">
          <NavLink to={dashboardPath} end className={linkClass}>
            <FaHome className="text-base" />
            Dashboard
          </NavLink>

          {isListener && (
            <>
              <NavLink
                to={getDashboardChildPath(user.role, "pricing")}
                className={linkClass}
              >
                <FaCrown className="text-base" />
                Pricing
              </NavLink>

              <NavLink
                to={getDashboardChildPath(user.role, "discover")}
                className={linkClass}
              >
                <FaCompass className="text-base" />
                Discover
              </NavLink>

              <NavLink
                to={getDashboardChildPath(user.role, "album")}
                className={linkClass}
              >
                <FaCompactDisc className="text-base" />
                Albums
              </NavLink>

              <NavLink
                to={getDashboardChildPath(user.role, "messages")}
                className={linkClass}
              >
                <FaComments className="text-base" />

                <span className="flex-1">Messages</span>

                {unreadConversations > 0 && (
                  <span
                    className="flex h-5 min-w-5 items-center justify-center rounded-full bg-linear-to-r from-red-500 to-rose-500 px-1.5 text-xs font-bold text-white"
                    style={{ animation: "badgePulse 2s ease-in-out infinite" }}
                  >
                    {unreadConversations > 9 ? "9+" : unreadConversations}
                  </span>
                )}
              </NavLink>

              <NavLink
                to={getDashboardChildPath(user.role, "liked-songs")}
                className={linkClass}
              >
                <FaHeart className="text-base" /> Liked Songs
              </NavLink>

              <NavLink
                to={getDashboardChildPath(user.role, "recently-played")}
                className={linkClass}
              >
                <FaHistory className="text-base" /> Recently Played
              </NavLink>

              <NavLink
                to={getDashboardChildPath(user.role, "following")}
                className={linkClass}
              >
                <FaUserFriends className="text-base" /> Following
              </NavLink>

              <NavLink
                to={getDashboardChildPath(user.role, "artists")}
                className={linkClass}
              >
                <FaMicrophone className="text-base" /> Artists
              </NavLink>
            </>
          )}

          {isArtist && (
            <>
              <NavLink
                to={getDashboardChildPath(user.role, "pricing")}
                className={linkClass}
              >
                <FaCrown className="text-base" />
                Pricing
              </NavLink>

              <NavLink
                to={getDashboardChildPath(user.role, "my-music")}
                className={linkClass}
              >
                <FaMusic className="text-base" />
                My Music
              </NavLink>

              <NavLink
                to={getDashboardChildPath(user.role, "my-albums")}
                className={linkClass}
              >
                <FaCompactDisc className="text-base" />
                Albums
              </NavLink>

              <NavLink
                to={getDashboardChildPath(user.role, "messages")}
                className={linkClass}
              >
                <FaComments className="text-base" />

                <span className="flex-1">Messages</span>

                {unreadConversations > 0 && (
                  <span
                    className="flex h-5 min-w-5 items-center justify-center rounded-full bg-linear-to-r from-red-500 to-rose-500 px-1.5 text-xs font-bold text-white"
                    style={{ animation: "badgePulse 2s ease-in-out infinite" }}
                  >
                    {unreadConversations > 9 ? "9+" : unreadConversations}
                  </span>
                )}
              </NavLink>

              <NavLink
                to={getDashboardChildPath(user.role, "upload-music")}
                className={linkClass}
              >
                <FaCloudUploadAlt className="text-base" />
                Upload Music
              </NavLink>

              <NavLink
                to={getDashboardChildPath(user.role, "create-album")}
                className={linkClass}
              >
                <FaPlus className="text-base" />
                Create Album
              </NavLink>
            </>
          )}

          {isAdmin && (
            <>
              <NavLink
                to={getDashboardChildPath(user.role, "users")}
                className={linkClass}
              >
                <FaUsers className="text-base" />
                Users
              </NavLink>
              <NavLink
                to={getDashboardChildPath(user.role, "content")}
                className={linkClass}
              >
                <FaShieldAlt className="text-base" />
                Moderation
              </NavLink>
              <NavLink
                to={getDashboardChildPath(user.role, "stats")}
                className={linkClass}
              >
                <FaChartBar className="text-base" />
                Stats
              </NavLink>
            </>
          )}

          <NavLink
            to={getDashboardChildPath(user.role, "profile")}
            className={linkClass}
          >
            <FaUser className="text-base" />
            Profile
          </NavLink>

          <NavLink
            to={getDashboardChildPath(user.role, "settings")}
            className={linkClass}
          >
            <FaCog className="text-base" />
            Settings
          </NavLink>
        </nav>

        {/* Logout */}
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="group relative mt-3 flex cursor-pointer items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm font-medium text-red-400 transition-all duration-300 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]"
        >
          <FaSignOutAlt className="text-base transition-transform duration-300 group-hover:-translate-x-0.5" />
          Logout
        </button>
      </aside>

      {/* ========================================
          Main Content
      ======================================== */}

      <div className="relative z-10 flex flex-1 flex-col">
        <header className="flex items-center justify-end border-b border-violet-500/10 bg-gray-900/40 px-8 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                {user?.username?.[0]?.toUpperCase() || "U"}
              </div>
              {/* Online dot */}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-gray-900 bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            </div>

            <span className="text-sm font-medium text-gray-200">
              {user?.username}
            </span>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};
