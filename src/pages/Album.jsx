import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FaCompactDisc, FaArrowRight, FaMusic } from "react-icons/fa";
import { getDashboardChildPath } from "../routes/routePaths.js";
import { useAuth } from "../context/AuthContext.jsx";

import api from "../services/api.js";

export const Album = () => {
  const { user } = useAuth();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/music/albums");

        console.log("Albums API Response:", response.data);

        setAlbums(response.data.albums || []);
      } catch (error) {
        console.error("Failed to fetch albums:", error);

        setError(error.response?.data?.message || "Unable to load albums.");
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950 text-white">
      {/* Keyframes */}
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 animate-pulse rounded-full bg-violet-500/10 blur-[120px]" />
        <div
          className="absolute -right-40 bottom-20 h-96 w-96 animate-pulse rounded-full bg-fuchsia-600/8 blur-[120px]"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 animate-fade-in-up">
        {/* Header */}
        <div className="mb-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
            </span>
            Your Collection
          </p>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                <span className="bg-linear-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Albums
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-gray-400">
                Explore albums and discover music from your favorite artists.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-gray-700/50 bg-gray-900/50 px-4 py-2 text-sm text-gray-300 backdrop-blur-sm">
              <FaCompactDisc className="text-violet-400" />
              <span>
                {albums.length} {albums.length === 1 ? "Album" : "Albums"}
              </span>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-12 text-center backdrop-blur-sm">
            <FaCompactDisc
              className="mx-auto mb-4 text-4xl text-violet-400"
              style={{ animation: "spinSlow 2s linear infinite" }}
            />
            <p className="text-gray-400">Loading albums...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-10 text-center backdrop-blur-sm">
            <p className="text-red-400">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="group relative mt-5 inline-flex items-center gap-2 overflow-hidden rounded-full bg-linear-to-r from-red-500 to-rose-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]"
            >
              <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative">Try Again</span>
            </button>
          </div>
        )}

        {/* No Albums */}
        {!loading && !error && albums.length === 0 && (
          <div className="rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-12 text-center backdrop-blur-sm">
            <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-violet-500/10 blur-2xl" />
              <FaMusic className="relative text-5xl text-violet-500/40" />
            </div>

            <h2 className="text-2xl font-bold">No albums yet</h2>

            <p className="mt-2 text-gray-400">
              Albums created by artists will appear here.
            </p>
          </div>
        )}

        {/* Albums Grid */}
        {!loading && !error && albums.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {albums.map((album) => (
              <div
                key={album._id}
                className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-violet-500/40 hover:shadow-[0_20px_60px_-15px_rgba(139,92,246,0.4)]"
              >
                {/* Corner glow */}
                <div className="pointer-events-none absolute -right-10 -top-10 z-10 h-32 w-32 rounded-full bg-violet-500/15 blur-3xl transition-all duration-500 group-hover:bg-violet-500/30" />

                {/* Artwork */}
                <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-linear-to-br from-violet-500/25 via-fuchsia-500/10 to-gray-950">
                  <FaCompactDisc
                    className="text-8xl text-violet-400/70 transition-all duration-500 group-hover:text-violet-300/90"
                    style={{
                      animation: "spinSlow 12s linear infinite",
                      animationPlayState: "paused",
                    }}
                  />
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-linear-to-t from-gray-950/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Play/View Button */}
                  <NavLink
                    to={getDashboardChildPath(user?.role, `album/${album._id}`)}
                    className="absolute bottom-4 right-4 z-10 flex h-12 w-12 translate-y-2 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 text-white opacity-0 shadow-[0_0_25px_rgba(139,92,246,0.6)] transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110"
                  >
                    <FaArrowRight className="text-sm" />
                  </NavLink>
                </div>

                {/* Album Info */}
                <div className="relative p-5">
                  <h2 className="truncate text-xl font-bold transition-colors duration-300 group-hover:text-violet-300">
                    {album.title}
                  </h2>

                  <p className="mt-2 truncate text-sm text-gray-400">
                    {album.artist?.username || "Unknown Artist"}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-300">
                      {album.musics?.length || 0}{" "}
                      {album.musics?.length === 1 ? "Song" : "Songs"}
                    </span>

                    <NavLink
                      to={getDashboardChildPath(
                        user?.role,
                        `album/${album._id}`,
                      )}
                      className="group/link flex items-center gap-2 text-sm font-semibold text-violet-400 transition-colors duration-300 hover:text-violet-300"
                    >
                      View Album
                      <FaArrowRight className="text-xs transition-transform duration-300 group-hover/link:translate-x-1" />
                    </NavLink>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
