import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FaMusic,
  FaCompactDisc,
  FaCloudUploadAlt,
  FaPlus,
  FaCompass,
  FaUsers,
  FaHistory,
  FaShieldAlt,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { getDashboardChildPath } from "../routes/routePaths.js";

import api from "../services/api.js";
import { useAuth } from "../context/AuthContext";

export const Dashboard = () => {
  const { user, isArtist, isAdmin } = useAuth();

  const [musicCount, setMusicCount] = useState(0);
  const [albumCount, setAlbumCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(isArtist);

  useEffect(() => {
    if (!isArtist) return;

    const fetchStats = async () => {
      try {
        setLoadingStats(true);

        const [musicRes, albumRes] = await Promise.all([
          api.get("/music/my-music"),
          api.get("/music/my-albums"),
        ]);

        setMusicCount(musicRes.data.musics?.length || 0);
        setAlbumCount(albumRes.data.albums?.length || 0);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [isArtist]);

  // ========================================
  // Shared background + keyframes (rendered once)
  // ========================================
  const Background = () => (
    <>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 animate-pulse rounded-full bg-violet-500/15 blur-[120px]" />
        <div
          className="absolute -right-40 top-1/3 h-96 w-96 animate-pulse rounded-full bg-fuchsia-600/12 blur-[120px]"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute -bottom-40 left-1/3 h-96 w-96 animate-pulse rounded-full bg-purple-400/12 blur-[120px]"
          style={{ animationDelay: "2s" }}
        />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139,92,246,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.6) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            animation: "gridMove 20s linear infinite",
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardGlow {
          0%, 100% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.1), 0 0 80px rgba(217, 70, 239, 0.05); }
          50% { box-shadow: 0 0 60px rgba(139, 92, 246, 0.18), 0 0 100px rgba(217, 70, 239, 0.08); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    </>
  );

  // ========================================
  // ADMIN
  // ========================================
  if (isAdmin) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gray-950 text-white">
        <Background />

        <div className="relative z-10 mx-auto max-w-7xl px-8 py-12 animate-fade-in-up">
          <p className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-red-400 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <FaShieldAlt className="text-[10px]" />
            Admin Console
          </p>

          <h1 className="mt-5 text-5xl font-black leading-tight tracking-tight">
            <span className="bg-linear-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Welcome,{" "}
            </span>
            <span
              className="bg-linear-to-r from-red-400 via-rose-400 to-red-500 bg-clip-text text-transparent"
              style={{
                backgroundSize: "200% auto",
                animation: "gradientShift 4s ease infinite",
              }}
            >
              {user?.username}
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-lg text-gray-400">
            Manage users and platform access from here.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
            {/* Manage Users Card */}
            <NavLink
              to={getDashboardChildPath(user.role, "users")}
              className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-red-500/40 hover:shadow-[0_20px_60px_-15px_rgba(239,68,68,0.4)]"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-500/15 blur-3xl transition-all duration-500 group-hover:bg-red-500/30" />
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-red-500/25 to-rose-500/10 text-red-400 transition-all duration-500 group-hover:scale-110 group-hover:text-red-300 group-hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                  <FaUsers className="text-xl" />
                </div>
                <h3 className="text-lg font-bold transition-colors duration-300 group-hover:text-red-300">
                  Manage Users
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  View, edit, and control platform access.
                </p>
                <div className="mt-4 h-1 w-12 rounded-full bg-linear-to-r from-red-500 to-transparent transition-all duration-500 group-hover:w-20" />
              </div>
            </NavLink>

            {/* Audit Log Card */}
            <NavLink
              to={getDashboardChildPath(user.role, "audit-log")}
              className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-rose-500/40 hover:shadow-[0_20px_60px_-15px_rgba(244,63,94,0.4)]"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-rose-500/15 blur-3xl transition-all duration-500 group-hover:bg-rose-500/30" />
              <div className="relative">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-rose-500/25 to-red-500/10 text-rose-400 transition-all duration-500 group-hover:scale-110 group-hover:text-rose-300 group-hover:shadow-[0_0_30px_rgba(244,63,94,0.5)]">
                  <FaHistory className="text-xl" />
                </div>
                <h3 className="text-lg font-bold transition-colors duration-300 group-hover:text-rose-300">
                  Audit Log
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  Review platform activity and events.
                </p>
                <div className="mt-4 h-1 w-12 rounded-full bg-linear-to-r from-rose-500 to-transparent transition-all duration-500 group-hover:w-20" />
              </div>
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // ARTIST
  // ========================================
  if (isArtist) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gray-950 text-white">
        <Background />

        <div className="relative z-10 mx-auto max-w-7xl px-8 py-12 animate-fade-in-up">
          <p className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
            </span>
            Artist Studio
          </p>

          <h1 className="mt-5 text-5xl font-black leading-tight tracking-tight">
            <span className="bg-linear-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Welcome,{" "}
            </span>
            <span
              className="bg-linear-to-r from-violet-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent"
              style={{
                backgroundSize: "200% auto",
                animation: "gradientShift 4s ease infinite",
              }}
            >
              {user?.username}
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-lg text-gray-400">
            Manage your music, albums and uploads from one place.
          </p>

          {/* Stats */}
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:max-w-3xl">
            {/* Songs Card */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-[0_20px_60px_-15px_rgba(139,92,246,0.4)]">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/15 blur-3xl transition-all duration-500 group-hover:bg-violet-500/30" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-violet-500/25 to-fuchsia-500/10 text-violet-400 transition-all duration-500 group-hover:scale-110 group-hover:text-violet-300">
                    <FaMusic className="text-xl" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                    Songs
                  </span>
                </div>
                <p className="mt-5 text-sm text-gray-400">Total Songs</p>
                <p className="mt-1 text-5xl font-black tracking-tight">
                  <span className="bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {loadingStats ? "…" : musicCount}
                  </span>
                </p>
              </div>
            </div>

            {/* Albums Card */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-7 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-fuchsia-500/40 hover:shadow-[0_20px_60px_-15px_rgba(217,70,239,0.4)]">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-fuchsia-500/15 blur-3xl transition-all duration-500 group-hover:bg-fuchsia-500/30" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-fuchsia-500/25 to-violet-500/10 text-fuchsia-400 transition-all duration-500 group-hover:scale-110 group-hover:text-fuchsia-300">
                    <FaCompactDisc className="text-xl" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-400">
                    Albums
                  </span>
                </div>
                <p className="mt-5 text-sm text-gray-400">Total Albums</p>
                <p className="mt-1 text-5xl font-black tracking-tight">
                  <span className="bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {loadingStats ? "…" : albumCount}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-10 flex flex-wrap gap-4">
            <NavLink
              to={getDashboardChildPath(user.role, "upload-music")}
              className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 px-7 py-3.5 font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.6)]"
            >
              <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <FaCloudUploadAlt className="relative text-base transition-transform duration-300 group-hover:-translate-y-0.5" />
              <span className="relative">Upload Music</span>
            </NavLink>

            <NavLink
              to={getDashboardChildPath(user.role, "create-album")}
              className="group flex items-center gap-3 rounded-full border border-gray-700/50 bg-gray-900/50 px-7 py-3.5 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-violet-500/50 hover:bg-violet-500/5 hover:text-violet-300"
            >
              <FaPlus className="text-sm transition-transform duration-300 group-hover:rotate-90" />
              Create Album
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // LISTENER
  // ========================================
  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950 text-white">
      <Background />

      <div className="relative z-10 mx-auto max-w-7xl px-8 py-12 animate-fade-in-up">
        <p className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-purple-400 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500" />
          </span>
          Listener Hub
        </p>

        <h1 className="mt-5 flex flex-wrap items-center text-5xl font-black leading-tight tracking-tight">
          <span className="bg-linear-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Welcome back,{" "}
          </span>
          <span
            className="bg-linear-to-r from-violet-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent"
            style={{
              backgroundSize: "200% auto",
              animation: "gradientShift 4s ease infinite",
            }}
          >
            {user?.username}
          </span>
          {user?.subscriptionStatus === "premium" && (
            <MdVerified
              className="ml-3 inline-block text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.7)]"
              title="Premium"
            />
          )}
        </h1>

        <p className="mt-4 max-w-xl text-lg text-gray-400">
          Discover, listen and enjoy your favorite music.
        </p>

        {/* Actions */}
        <div className="mt-10 flex flex-wrap gap-4">
          <NavLink
            to={getDashboardChildPath(user.role, "discover")}
            className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 px-7 py-3.5 font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.6)]"
          >
            <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <FaCompass className="relative text-base transition-transform duration-300 group-hover:rotate-45" />
            <span className="relative">Discover Music</span>
          </NavLink>

          <NavLink
            to={getDashboardChildPath(user.role, "album")}
            className="group flex items-center gap-3 rounded-full border border-gray-700/50 bg-gray-900/50 px-7 py-3.5 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-violet-500/50 hover:bg-violet-500/5 hover:text-violet-300"
          >
            <FaCompactDisc className="text-base transition-transform duration-300 group-hover:rotate-180" />
            Browse Albums
          </NavLink>
        </div>

        {/* Quick hint tiles */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3 lg:max-w-4xl">
          <div className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-5 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-violet-500/30">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl transition-all duration-500 group-hover:bg-violet-500/25" />
            <FaMusic className="relative text-lg text-violet-400" />
            <p className="relative mt-3 text-sm font-semibold text-white">
              Millions of tracks
            </p>
            <p className="relative mt-1 text-xs text-gray-400">
              Fresh music added daily.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-5 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-fuchsia-500/30">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-fuchsia-500/10 blur-2xl transition-all duration-500 group-hover:bg-fuchsia-500/25" />
            <FaCompactDisc className="relative text-lg text-fuchsia-400" />
            <p className="relative mt-3 text-sm font-semibold text-white">
              Curated albums
            </p>
            <p className="relative mt-1 text-xs text-gray-400">
              Explore full artist collections.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-5 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-purple-500/30">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl transition-all duration-500 group-hover:bg-purple-500/25" />
            <FaCompass className="relative text-lg text-purple-400" />
            <p className="relative mt-3 text-sm font-semibold text-white">
              Discover new artists
            </p>
            <p className="relative mt-1 text-xs text-gray-400">
              Find your next favorite sound.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
