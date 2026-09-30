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
      ? "font-bold text-amber-700"
      : "text-gray-700 hover:text-amber-700 transition";

  return (
    <>
      <nav className="sticky top-0 z-50 bg-linear-to-r from-[#ffffff] via-[#fafafa] to-[#ffffff] border-b border-[#e8e8e8] backdrop-blur-md shadow-lg">
        <div className="mx-auto px-4 sm:px-6 md:px-12 py-4 flex items-center justify-around lg:px-20">
          {/* Logo */}
          <NavLink to="/" className="text-2xl font-bold text-amber-600">
            Spookeify
          </NavLink>

          <OnlineCount />

          {/* Navigation */}
          <div className="flex items-center gap-6 text-sm">
            <NavLink to="/" className={navClass}>
              Home
            </NavLink>

            <NavLink to="/about" className={navClass}>
              About
            </NavLink>

            {/* ========================================
                Logged In
            ======================================== */}

            {user ? (
              <>
                <NavLink to={getDashboardPath(user.role)} className={navClass}>
                  Dashboard
                </NavLink>

                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="text-red-600 hover:text-red-700 font-medium transition cursor-pointer flex items-center gap-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
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
                <NavLink to="/login" className={navClass}>
                  Login
                </NavLink>

                <NavLink
                  to="/register"
                  className="rounded-full bg-amber-500 px-4 py-2 font-semibold text-gray-950 transition hover:bg-amber-400"
                >
                  Signup
                </NavLink>
              </>
            )}
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
