import { NavLink } from "react-router-dom";
import { FaMusic, FaHome, FaCompactDisc, FaArrowRight } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import { getDashboardChildPath, getDashboardPath } from "../routes/routePaths.js";

export const NotFoundPage = () => {
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);
  const dashboardPath = getDashboardPath(user?.role);
  const albumsPath = user
    ? getDashboardChildPath(
        user.role,
        user.role === "artist" ? "my-albums" : "album",
      )
    : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
        {/* Background */}

        <div className="absolute inset-0 bg-linear-to-br from-amber-500/10 via-gray-950 to-gray-950" />

        <div className="absolute left-1/2 top-1/2 h-100 w-100 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/5 blur-3xl" />

        {/* Content */}

        <div className="relative z-10 w-full max-w-2xl text-center">
          {/* Music Icon */}

          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-500 shadow-2xl shadow-amber-500/5">
            <FaMusic className="text-4xl" />
          </div>

          {/* 404 */}

          <p className="mt-8 text-8xl font-black tracking-tight text-amber-500 sm:text-9xl">
            404
          </p>

          <h1 className="mt-4 text-3xl font-black sm:text-4xl">
            This track doesn't exist.
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-gray-400 sm:text-lg">
            Looks like you took a wrong turn. The page you're looking for
            couldn't be found or may have been moved somewhere else.
          </p>

          {/* Actions */}

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <NavLink
              to={isAuthenticated ? dashboardPath : "/"}
              className="inline-flex items-center gap-3 rounded-full bg-amber-500 px-7 py-3.5 font-bold text-gray-950 transition hover:bg-amber-400"
            >
              {isAuthenticated ? (
                <FaArrowRight className="text-sm rotate-180" />
              ) : (
                <FaHome className="text-sm" />
              )}
              {isAuthenticated ? "Back to Dashboard" : "Back to Home"}
            </NavLink>

            {albumsPath && (
              <NavLink
                to={albumsPath}
                className="inline-flex items-center gap-3 rounded-full border border-gray-700 px-7 py-3.5 font-semibold text-white transition hover:border-amber-500 hover:text-amber-500"
              >
                Explore Albums
                <FaCompactDisc className="text-sm" />
              </NavLink>
            )}
          </div>

          {/* Bottom Message */}

          <div className="mx-auto mt-12 max-w-md rounded-2xl border border-gray-800 bg-gray-900/70 p-5">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <span>Maybe your next favorite song is waiting</span>
              <FaArrowRight className="text-amber-500" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
