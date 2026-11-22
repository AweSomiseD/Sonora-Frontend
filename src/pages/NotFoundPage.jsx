import { Link } from "react-router-dom";
import { FaArrowLeft, FaCompass, FaHome, FaMusic } from "react-icons/fa";
import AppBackground from "../components/AppBackground.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import { getDashboardChildPath, getDashboardPath } from "../routes/routePaths.js";

export const NotFoundPage = () => {
  usePageTitle("Page not found");
  const { isAuthenticated, activeRole } = useAuth();
  const explorePath = isAuthenticated && activeRole === "listener" ? getDashboardChildPath("listener", "discover") : null;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-950 px-4 text-white">
      <AppBackground />
      <div className="animate-fade-in-up relative z-10 w-full max-w-xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300">
          <FaMusic className="text-3xl" aria-hidden="true" />
        </div>
        <p className="mt-6 bg-linear-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-8xl font-black text-transparent">404</p>
        <h1 className="mt-3 text-2xl font-black sm:text-3xl">This page skipped a beat</h1>
        <p className="mx-auto mt-3 max-w-md text-gray-400">The page you are looking for does not exist or was moved.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to={isAuthenticated ? getDashboardPath(activeRole) : "/"} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-600 px-6 font-semibold hover:opacity-90">
            {isAuthenticated ? <FaArrowLeft aria-hidden="true" /> : <FaHome aria-hidden="true" />}
            {isAuthenticated ? "Back to dashboard" : "Back to home"}
          </Link>
          {explorePath && (
            <Link to={explorePath} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-violet-500/30 px-6 font-semibold text-gray-200 hover:bg-violet-500/10">
              <FaCompass aria-hidden="true" /> Discover music
            </Link>
          )}
        </div>
      </div>
    </main>
  );
};

export default NotFoundPage;
