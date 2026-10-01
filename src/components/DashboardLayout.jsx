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
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
      isActive
        ? "bg-amber-500/10 text-amber-500"
        : "text-gray-400 hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      {/* ========================================
          Sidebar
      ======================================== */}

      <aside className="flex w-64 shrink-0 flex-col border-r border-gray-800 bg-gray-900/50 p-5">
        <NavLink
          to="/"
          className="mb-8 flex items-center gap-2 text-xl font-bold text-amber-500"
        >
          Spookeify
        </NavLink>

        <nav className="flex flex-1 flex-col gap-1">
          <NavLink to={dashboardPath} end className={linkClass}>
            <FaHome />
            Dashboard
          </NavLink>

          {isListener && (
            <>
              <NavLink
                to={getDashboardChildPath(user.role, "discover")}
                className={linkClass}
              >
                <FaCompass />
                Discover
              </NavLink>

              <NavLink
                to={getDashboardChildPath(user.role, "album")}
                className={linkClass}
              >
                <FaCompactDisc />
                Albums
              </NavLink>

              <NavLink
                to={getDashboardChildPath(user.role, "messages")}
                className={linkClass}
              >
                <FaComments />

                <span className="flex-1">Messages</span>

                {unreadConversations > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                    {unreadConversations > 9 ? "9+" : unreadConversations}
                  </span>
                )}
              </NavLink>

              <NavLink
                to={getDashboardChildPath(user.role, "liked-songs")}
                className={linkClass}
              >
                <FaHeart /> Liked Songs
              </NavLink>

              <NavLink
                to={getDashboardChildPath(user.role, "recently-played")}
                className={linkClass}
              >
                <FaHistory /> Recently Played
              </NavLink>

              <NavLink
                to={getDashboardChildPath(user.role, "following")}
                className={linkClass}
              >
                <FaUserFriends /> Following
              </NavLink>

              <NavLink
                to={getDashboardChildPath(user.role, "artists")}
                className={linkClass}
              >
                <FaMicrophone /> Artists
              </NavLink>
            </>
          )}

          {isArtist && (
            <>
              <NavLink
                to={getDashboardChildPath(user.role, "my-music")}
                className={linkClass}
              >
                <FaMusic />
                My Music
              </NavLink>

              <NavLink
                to={getDashboardChildPath(user.role, "my-albums")}
                className={linkClass}
              >
                <FaCompactDisc />
                Albums
              </NavLink>

              <NavLink
                to={getDashboardChildPath(user.role, "messages")}
                className={linkClass}
              >
                <FaComments />

                <span className="flex-1">Messages</span>

                {unreadConversations > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                    {unreadConversations > 9 ? "9+" : unreadConversations}
                  </span>
                )}
              </NavLink>

              <NavLink
                to={getDashboardChildPath(user.role, "upload-music")}
                className={linkClass}
              >
                <FaCloudUploadAlt />
                Upload Music
              </NavLink>

              <NavLink
                to={getDashboardChildPath(user.role, "create-album")}
                className={linkClass}
              >
                <FaPlus />
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
                <FaUsers />
                Users
              </NavLink>
              <NavLink
                to={getDashboardChildPath(user.role, "content")}
                className={linkClass}
              >
                <FaShieldAlt />
                Moderation
              </NavLink>
              <NavLink
                to={getDashboardChildPath(user.role, "stats")}
                className={linkClass}
              >
                <FaChartBar />
                Stats
              </NavLink>
            </>
          )}

          <NavLink
            to={getDashboardChildPath(user.role, "profile")}
            className={linkClass}
          >
            <FaUser />
            Profile
          </NavLink>

          <NavLink
            to={getDashboardChildPath(user.role, "settings")}
            className={linkClass}
          >
            <FaCog />
            Settings
          </NavLink>
        </nav>

        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-500/10"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </aside>

      {/* ========================================
          Main Content
      ======================================== */}

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-end border-b border-gray-800 bg-gray-900/30 px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 text-sm font-bold text-amber-500">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </div>

            <span className="text-sm font-medium">{user?.username}</span>
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
