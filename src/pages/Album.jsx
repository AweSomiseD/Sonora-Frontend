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
    <div className="min-h-screen bg-gray-950 text-white">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}

        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
            Your Collection
          </p>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-black sm:text-5xl">Albums</h1>

              <p className="mt-3 max-w-2xl text-gray-400">
                Explore albums and discover music from your favorite artists.
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <FaCompactDisc className="text-amber-500" />
              {albums.length} {albums.length === 1 ? "Album" : "Albums"}
            </div>
          </div>
        </div>

        {/* Loading */}

        {loading && (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-12 text-center">
            <FaCompactDisc className="mx-auto mb-4 animate-spin text-4xl text-amber-500" />

            <p className="text-gray-400">Loading albums...</p>
          </div>
        )}

        {/* Error */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-900 bg-red-950/30 p-10 text-center">
            <p className="text-red-400">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white hover:bg-red-400"
            >
              Try Again
            </button>
          </div>
        )}

        {/* No Albums */}

        {!loading && !error && albums.length === 0 && (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-12 text-center">
            <FaMusic className="mx-auto mb-5 text-5xl text-gray-700" />

            <h2 className="text-2xl font-bold">No albums yet</h2>

            <p className="mt-2 text-gray-400">
              Albums created by artists will appear here.
            </p>
          </div>
        )}

        {/* Albums */}

        {!loading && !error && albums.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {albums.map((album) => (
              <div
                key={album._id}
                className="group overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 transition duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:bg-gray-800"
              >
                {/* Artwork */}

                <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-linear-to-br from-amber-500/20 via-gray-800 to-gray-950">
                  <FaCompactDisc className="text-8xl text-amber-500/70 transition duration-500 group-hover:scale-110 group-hover:rotate-12" />

                  {/* Play/View Button */}

                  <NavLink
                    to={getDashboardChildPath(user?.role, `album/${album._id}`)}
                    className="absolute bottom-4 right-4 flex h-12 w-12 translate-y-2 items-center justify-center rounded-full bg-amber-500 text-gray-950 opacity-0 shadow-xl transition-all group-hover:translate-y-0 group-hover:opacity-100 hover:bg-amber-400"
                  >
                    <FaArrowRight />
                  </NavLink>
                </div>

                {/* Album Info */}

                <div className="p-5">
                  <h2 className="truncate text-xl font-bold">{album.title}</h2>

                  <p className="mt-2 truncate text-sm text-gray-400">
                    {album.artist?.username || "Unknown Artist"}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {album.musics?.length || 0}{" "}
                      {album.musics?.length === 1 ? "Song" : "Songs"}
                    </span>

                    <NavLink
                      to={getDashboardChildPath(
                        user?.role,
                        `album/${album._id}`,
                      )}
                      className="flex items-center gap-2 text-sm font-semibold text-amber-500 transition hover:text-amber-400"
                    >
                      View Album
                      <FaArrowRight className="text-xs" />
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
