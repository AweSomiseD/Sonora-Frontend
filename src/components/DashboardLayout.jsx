import { Suspense, useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext.jsx";
import { getDashboardChildPath } from "../routes/routePaths.js";
import AppBackground from "./AppBackground.jsx";
import LogoutModal from "./LogoutModel.jsx";
import NotificationBell from "./NotificationBell.jsx";
import PlayerBar from "./PlayerBar.jsx";
import PremiumBadge from "./PremiumBadge.jsx";
import SidebarNav from "./SidebarNav.jsx";
import SwitchRoleButton from "./SwitchRoleButton.jsx";
import { Avatar, Badge, SkeletonList } from "./ui/index.jsx";

const MODE_LABEL = {
  listener: "Listener",
  artist: "Artist Studio",
  admin: "Admin",
};

function Logo() {
  return (
    <Link
      to="/"
      className="group flex items-center gap-2.5 text-xl font-black tracking-tight"
      aria-label="Sonora home"
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white"
        style={{ animation: "logoGlow 3s ease-in-out infinite" }}
      >
        S
      </span>
      <span className="bg-linear-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
        Sonora
      </span>
    </Link>
  );
}

export const DashboardLayout = () => {
  const { user, activeRole, logout } = useAuth();
  const { currentTrack } = usePlayer();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const location = useLocation();
  const isMessagesPage = location.pathname.endsWith("/messages");

  // Close the mobile drawer on navigation and with Escape
  useEffect(() => setDrawerOpen(false), [location.pathname]);
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const renderSidebar = (showRoleSwitch = false) => (
    <SidebarNav
      showRoleSwitch={showRoleSwitch}
      onNavigate={() => setDrawerOpen(false)}
      onLogout={() => setLogoutOpen(true)}
    />
  );
  const isPremium = Boolean(user?.isPremium);

  return (
    <div
      className={`relative flex ${isMessagesPage ? "h-dvh overflow-hidden" : "min-h-screen"} bg-gray-950 text-white`}
    >
      <AppBackground />
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-violet-600 px-4 py-2 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="relative z-20 hidden w-64 shrink-0 flex-col border-r border-violet-500/10 bg-gray-900/60 p-5 backdrop-blur-xl xl:flex">
        <div className="mb-6">
          <Logo />
        </div>
        {renderSidebar()}
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 xl:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="animate-drawer-in relative flex h-full w-72 max-w-[85vw] flex-col border-r border-violet-500/20 bg-gray-900 p-5">
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-gray-400 hover:bg-white/5"
                aria-label="Close menu"
              >
                <FaTimes aria-hidden="true" />
              </button>
            </div>
            {renderSidebar(true)}
          </aside>
        </div>
      )}

      <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex shrink-0 items-center gap-2 border-b border-violet-500/10 bg-gray-950/80 px-3 py-3 backdrop-blur-xl sm:px-6">
          <div className="xl:hidden">
            <Logo />
          </div>
          <Badge
            tone={
              activeRole === "artist"
                ? "fuchsia"
                : activeRole === "admin"
                  ? "yellow"
                  : "violet"
            }
            className="ml-1 min-w-0 max-w-32 truncate whitespace-nowrap"
          >
            {MODE_LABEL[activeRole]}
          </Badge>

          <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-2">
            <div className="hidden xl:flex">
              <SwitchRoleButton />
            </div>
            <NotificationBell />
            <Link
              to={getDashboardChildPath(activeRole, "profile")}
              className="hidden items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-white/5 xl:flex"
              aria-label="Your profile"
            >
              <Avatar src={user?.avatar} name={user?.username} size="sm" />
              <span className="hidden max-w-40 truncate text-sm font-medium text-gray-200 md:block">
                {user?.username}
              </span>
              {isPremium && <PremiumBadge />}
            </Link>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-gray-300 hover:bg-white/5 xl:hidden"
              aria-label="Open menu"
              aria-expanded={drawerOpen}
            >
              <FaBars aria-hidden="true" />
            </button>
          </div>
        </header>

        <main
          id="main-content"
          className={`flex-1 ${isMessagesPage ? `flex min-h-0 overflow-hidden px-3 pt-3 sm:px-6 sm:pt-4 ${currentTrack ? "pb-[calc(6.5rem+env(safe-area-inset-bottom))]" : "pb-3 sm:pb-4"}` : `px-3 pt-5 pb-10 sm:px-6 sm:pt-8 ${currentTrack ? "pb-32" : "sm:pb-8"}`}`}
        >
          <div
            className={`mx-auto w-full max-w-7xl ${isMessagesPage ? "flex min-h-0 flex-1 flex-col" : ""}`}
          >
            <Suspense fallback={<SkeletonList />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      <PlayerBar />
      <LogoutModal
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={async () => {
          setLogoutOpen(false);
          await logout();
        }}
      />
    </div>
  );
};

export default DashboardLayout;
