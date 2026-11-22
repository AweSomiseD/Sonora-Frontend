import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FaBars, FaSignOutAlt, FaTimes } from "react-icons/fa";
import LogoutModal from "./LogoutModel.jsx";
import { OnlineCount } from "./OnlineCount.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getDashboardPath } from "../routes/routePaths.js";

const linkClass = ({ isActive }) =>
  `nav-link-underline relative inline-flex min-h-10 items-center transition-colors ${isActive ? "active font-bold text-white" : "text-gray-300 hover:text-white"}`;

export const Navbar = () => {
  const { logout, user, activeRole } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu after navigating
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      showToast("Could not log out. Please try again.", "error");
    } finally {
      setLogoutOpen(false);
    }
  };

  // old links code is commented out to prevent access to login and register pages directly. If you want to access these pages, you can uncomment the imports and routes in AppRoutes.jsx.
  // const links = (
  //   <>
  //     <NavLink to="/" end className={linkClass}>
  //       Home
  //     </NavLink>
  //     <NavLink to="/about" className={linkClass}>
  //       About
  //     </NavLink>
  //     {user ? (
  //       <>
  //         <NavLink to={getDashboardPath(activeRole)} className={linkClass}>
  //           Dashboard
  //         </NavLink>
  //         <button
  //           type="button"
  //           onClick={() => setLogoutOpen(true)}
  //           className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 font-medium text-red-300 transition hover:bg-red-500/20"
  //         >
  //           <FaSignOutAlt aria-hidden="true" /> Log out
  //         </button>
  //       </>
  //     ) : (
  //       <>
  //         <NavLink to="/login" className={linkClass}>
  //           Log in
  //         </NavLink>
  //         <NavLink
  //           to="/register"
  //           className="inline-flex min-h-10 items-center justify-center rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 px-5 font-semibold text-white transition hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]"
  //         >
  //           Sign up free
  //         </NavLink>
  //       </>
  //     )}
  //   </>
  // );

  // temporarily removed login and register links to prevent direct access to these pages. If you want to access these pages, you can uncomment the imports and routes in AppRoutes.jsx.
  const links = (
    <>
      <NavLink to="/" end className={linkClass}>
        Home
      </NavLink>
      <NavLink to="/about" className={linkClass}>
        About
      </NavLink>
      {user && (
        <>
          <NavLink to={getDashboardPath(activeRole)} className={linkClass}>
            Dashboard
          </NavLink>
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 font-medium text-red-300 transition hover:bg-red-500/20"
          >
            <FaSignOutAlt aria-hidden="true" /> Log out
          </button>
        </>
      )}
    </>
  );

  return (
    <>
      <nav
        className="sticky top-0 z-50 border-b border-violet-500/20 bg-[#1a0b2e]/90 shadow-[0_4px_30px_rgba(139,92,246,0.2)] backdrop-blur-xl"
        aria-label="Main"
      >
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-violet-500/50 to-transparent"
          style={{
            backgroundSize: "200% 100%",
            animation: "borderFlow 6s linear infinite",
          }}
          aria-hidden="true"
        />
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <NavLink
            to="/"
            className="flex items-center gap-2 text-2xl font-black tracking-tight"
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white"
              style={{ animation: "logoPulse 3s ease-in-out infinite" }}
            >
              S
            </span>
            <span className="bg-linear-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
              Sonora
            </span>
          </NavLink>

          <OnlineCount className="hidden lg:flex" />

          <div className="hidden items-center gap-6 text-sm lg:flex">
            {links}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-gray-200 hover:bg-white/10 lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? (
              <FaTimes aria-hidden="true" />
            ) : (
              <FaBars aria-hidden="true" />
            )}
          </button>
        </div>

        {menuOpen && (
          <div
            id="mobile-menu"
            className="animate-fadeIn flex flex-col gap-2 border-t border-violet-500/10 px-4 pb-4 pt-2 text-base lg:hidden"
          >
            {links}
            <OnlineCount className="pt-2" />
          </div>
        )}
      </nav>

      <LogoutModal
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
};

export default Navbar;
