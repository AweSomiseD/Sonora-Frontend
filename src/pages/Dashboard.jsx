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
} from "react-icons/fa";
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

  if (isAdmin) {
    return (
      <div className="px-8 py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">
          Admin Console
        </p>

        <h1 className="mt-2 text-4xl font-black">
          Welcome, <span className="text-red-500">{user?.username}</span>
        </h1>

        <p className="mt-3 text-gray-400">
          Manage users and platform access from here.
        </p>

        <div className="mt-8">
          <NavLink
            to={getDashboardChildPath(user.role, "users")}
            className="inline-flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 font-bold text-gray-950 transition hover:bg-red-400"
          >
            <FaUsers />
            Manage Users
          </NavLink>
          <NavLink
            to={getDashboardChildPath(user.role, "audit-log")}
            className="inline-flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 font-bold text-gray-950 transition hover:bg-red-400"
          >
            <FaHistory />
            Audit Log
          </NavLink>
        </div>
      </div>
    );
  }

  if (isArtist) {
    return (
      <div className="px-8 py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">
          Artist Studio
        </p>

        <h1 className="mt-2 text-4xl font-black">
          Welcome, <span className="text-amber-500">{user?.username}</span>
        </h1>

        <p className="mt-3 text-gray-400">
          Manage your music, albums and uploads from one place.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-sm text-gray-400">Total Songs</p>
            <p className="mt-2 text-4xl font-black">
              {loadingStats ? "…" : musicCount}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-sm text-gray-400">Total Albums</p>
            <p className="mt-2 text-4xl font-black">
              {loadingStats ? "…" : albumCount}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <NavLink
            to={getDashboardChildPath(user.role, "upload-music")}
            className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 font-bold text-gray-950 transition hover:bg-amber-400"
          >
            <FaCloudUploadAlt />
            Upload Music
          </NavLink>

          <NavLink
            to={getDashboardChildPath(user.role, "create-album")}
            className="inline-flex items-center gap-2 rounded-full border border-gray-700 px-6 py-3 font-semibold transition hover:border-amber-500 hover:text-amber-500"
          >
            <FaPlus />
            Create Album
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-500">
        Listener Hub
      </p>

      <h1 className="mt-2 text-4xl font-black">
        Welcome back, <span className="text-purple-500">{user?.username}</span>
      </h1>

      <p className="mt-3 text-gray-400">
        Discover, listen and enjoy your favorite music.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <NavLink
          to={getDashboardChildPath(user.role, "discover")}
          className="inline-flex items-center gap-2 rounded-full bg-purple-500 px-6 py-3 font-bold text-gray-950 transition hover:bg-purple-400"
        >
          <FaCompass />
          Discover Music
        </NavLink>

        <NavLink
          to={getDashboardChildPath(user.role, "album")}
          className="inline-flex items-center gap-2 rounded-full border border-gray-700 px-6 py-3 font-semibold transition hover:border-purple-500 hover:text-purple-500"
        >
          <FaCompactDisc />
          Browse Albums
        </NavLink>
      </div>
    </div>
  );
};
