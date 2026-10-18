import { useEffect, useState } from "react";
import { FaUser, FaUserCheck } from "react-icons/fa";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext";

export const Following = () => {
  const { fetchCurrentUser } = useAuth();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState(null);

  const fetchFollowed = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/music/followed-artists");

      setArtists(response.data.artists || []);
    } catch (error) {
      console.error("Failed to fetch followed artists:", error);
      setError("Unable to load followed artists.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowed();
  }, []);

  const handleUnfollow = async (artistId) => {
    setPendingId(artistId);

    try {
      await api.post(`/music/artists/${artistId}/follow`);
      setArtists((prev) => prev.filter((a) => a._id !== artistId));
      await fetchCurrentUser(true);
    } catch (error) {
      console.error("Failed to unfollow:", error);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes userPulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.08); opacity: 1; }
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

      <div className="relative z-10 px-8 py-10 animate-fade-in-up">
        {/* Header */}
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
            </span>
            <FaUserCheck className="text-[10px]" />
            Your Artists
          </p>

          <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            <span className="bg-linear-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Following
            </span>
          </h1>

          {!loading && !error && artists.length > 0 && (
            <p className="mt-2 text-sm text-gray-400">
              {artists.length} {artists.length === 1 ? "artist" : "artists"}{" "}
              followed
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-8 rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-10 text-center backdrop-blur-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
            </div>
            <p className="mt-4 text-gray-400">Loading...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center backdrop-blur-sm">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && artists.length === 0 && (
          <div className="mt-8 rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-12 text-center backdrop-blur-sm">
            <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-violet-500/15 blur-2xl" />
              <div
                className="absolute inset-2 rounded-full border border-violet-500/20"
                style={{ animation: "userPulse 3s ease-in-out infinite" }}
              />
              <FaUser
                className="relative text-4xl text-violet-400/70"
                style={{ animation: "userPulse 3s ease-in-out infinite" }}
              />
            </div>

            <h3 className="text-xl font-bold">Not following anyone yet</h3>
            <p className="mt-2 text-gray-400">
              Artists you follow will appear here.
            </p>
          </div>
        )}

        {/* Artists Grid */}
        {!loading && !error && artists.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {artists.map((artist) => (
              <div
                key={artist._id}
                className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-5 text-center backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-[0_20px_60px_-15px_rgba(139,92,246,0.4)]"
              >
                {/* Corner glow */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl transition-all duration-500 group-hover:bg-violet-500/25" />

                {/* Avatar with gradient ring */}
                <div className="relative mx-auto h-16 w-16">
                  <div className="absolute inset-0 rounded-full bg-linear-to-br from-violet-500/40 to-fuchsia-500/30 blur-sm transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-violet-500/30 bg-linear-to-br from-violet-500/20 to-fuchsia-500/10 text-xl font-bold text-violet-300 transition-transform duration-500 group-hover:scale-105">
                    {artist.username?.[0]?.toUpperCase() || "A"}
                  </div>
                </div>

                <h3 className="relative mt-3 truncate font-semibold transition-colors duration-300 group-hover:text-violet-300">
                  {artist.username}
                </h3>

                <button
                  onClick={() => handleUnfollow(artist._id)}
                  disabled={pendingId === artist._id}
                  className="group/btn relative mt-3 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1.5 text-xs font-semibold text-violet-300 transition-all duration-300 hover:border-violet-500/50 hover:bg-violet-500/20 hover:text-violet-200 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaUserCheck className="text-xs transition-transform duration-300 group-hover/btn:scale-110" />
                  {pendingId === artist._id ? "Unfollowing..." : "Following"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
