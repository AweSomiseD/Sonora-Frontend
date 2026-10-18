import { useState } from "react";
import { NavLink } from "react-router-dom";
import LogoutModal from "../components/LogoutModel.jsx";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../routes/routePaths.js";
import { OnlineCount } from "../components/OnlineCount.jsx";

export const Navbar = () => {
  const { isArtist, logout, user } = useAuth();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLogoutModalOpen(false);
    }
  };

  const navClass = ({ isActive }) =>
    isActive
      ? "relative font-bold text-white"
      : "relative text-gray-300 hover:text-white transition-colors duration-300";

  return (
    <>
      {/* Keyframes for navbar-specific animations */}
      <style>{`
        @keyframes navShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes logoPulse {
          0%, 100% { box-shadow: 0 0 10px rgba(139, 92, 246, 0.4); }
          50% { box-shadow: 0 0 18px rgba(139, 92, 246, 0.7); }
        }
        @keyframes borderFlow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes neonShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .nav-link-underline::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -4px;
          height: 2px;
          width: 0%;
          background: linear-gradient(90deg, #8b5cf6, #d946ef);
          border-radius: 2px;
          transition: width 0.3s ease;
        }
        .nav-link-underline:hover::after,
        .nav-link-underline.active::after {
          width: 100%;
        }
      `}</style>

      <nav className="sticky top-0 z-50">
        {/* Animated glowing border bottom */}
        <div
          className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-violet-500/50 to-transparent"
          style={{
            backgroundSize: "200% 100%",
            animation: "borderFlow 6s linear infinite",
          }}
        />

        {/*
          ========================================
          Darker Neon Gradient Background
          ========================================
          Deep violet base with subtle neon shifts.
          Much darker — blends with landing page.
        */}
        <div
          className="relative border-b border-violet-500/20 shadow-[0_4px_30px_rgba(139,92,246,0.2)]"
          style={{
            background:
              "linear-gradient(90deg, #1a0b2e 0%, #2d1352 20%, #4c1d95 50%, #2d1352 80%, #1a0b2e 100%)",
            backgroundSize: "200% 200%",
            animation: "neonShift 10s ease infinite",
          }}
        >
          {/* Subtle violet glow layer on top of dark base */}
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse at 50% 100%, rgba(139, 92, 246, 0.25) 0%, transparent 70%)",
            }}
          />

          {/* Noise texture for depth */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative mx-auto flex items-center justify-around px-4 py-4 sm:px-6 md:px-12 lg:px-20">
            {/* ========================================
                Logo
            ======================================== */}
            <NavLink
              to="/"
              className="group relative flex items-center gap-2 text-2xl font-black tracking-tight"
            >
              {/* Violet badge with soft glow */}
              <span
                className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white"
                style={{ animation: "logoPulse 3s ease-in-out infinite" }}
              >
                <span className="relative z-10">S</span>
                {/* Shimmer effect inside logo */}
                <span className="absolute inset-0 overflow-hidden rounded-lg">
                  <span
                    className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent"
                    style={{ animation: "navShimmer 3s ease-in-out infinite" }}
                  />
                </span>
              </span>

              {/* Brand text — soft violet-white gradient */}
              <span className="bg-linear-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-transparent transition-all duration-300 group-hover:from-violet-200 group-hover:via-fuchsia-200 group-hover:to-purple-200">
                Sonora
              </span>
            </NavLink>

            <OnlineCount />

            {/* ========================================
                Navigation
            ======================================== */}
            <div className="flex items-center gap-6 text-sm">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `${navClass({ isActive })} nav-link-underline ${isActive ? "active" : ""}`
                }
              >
                Home
              </NavLink>

              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `${navClass({ isActive })} nav-link-underline ${isActive ? "active" : ""}`
                }
              >
                About
              </NavLink>

              {/* ========================================
                  Logged In
              ======================================== */}

              {user ? (
                <>
                  <NavLink
                    to={getDashboardPath(user.role)}
                    className={({ isActive }) =>
                      `${navClass({ isActive })} nav-link-underline ${isActive ? "active" : ""}`
                    }
                  >
                    Dashboard
                  </NavLink>

                  <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="group relative flex cursor-pointer items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 font-medium text-red-400 transition-all duration-300 hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                </>
              ) : (
                /* ========================================
                    Logged Out
                ======================================== */

                <>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `${navClass({ isActive })} nav-link-underline ${isActive ? "active" : ""}`
                    }
                  >
                    Login
                  </NavLink>

                  <NavLink
                    to="/register"
                    className="group relative overflow-hidden rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 px-5 py-2 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <span className="relative">Signup</span>
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
};
