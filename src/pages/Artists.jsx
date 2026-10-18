import { useEffect, useState } from "react";
import { FaSearch, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import api from "../services/api.js";

export const Artists = () => {
  const [query, setQuery] = useState("");
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await api.get("/music/artists", {
          params: query.trim() ? { q: query.trim() } : {},
        });
        setArtists(response.data.artists || []);
      } catch {
        setArtists([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative min-h-screen overflow-hidden">
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
        @keyframes searchGlow {
          0%, 100% { box-shadow: 0 0 0 rgba(139, 92, 246, 0); }
          50% { box-shadow: 0 0 25px rgba(139, 92, 246, 0.25); }
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
            Discover creators
          </p>

          <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            <span className="bg-linear-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Artists
            </span>
          </h1>
        </div>

        {/* Search Bar */}
        <div
          className="relative mt-6 max-w-md rounded-xl p-px transition-all duration-300"
          style={{ animation: "searchGlow 4s ease-in-out infinite" }}
        >
          <div
            className="absolute inset-0 rounded-xl bg-linear-to-r from-violet-500/40 via-fuchsia-500/40 to-purple-500/40 opacity-70"
            style={{
              backgroundSize: "200% 200%",
              animation: "gradientShift 5s ease infinite",
            }}
          />

          <div className="relative flex items-center rounded-[calc(0.75rem-1px)] bg-gray-950/90 backdrop-blur-md">
            <FaSearch className="absolute left-4 text-sm text-violet-400" />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search artists..."
              className="w-full rounded-xl bg-transparent py-3 pl-11 pr-4 text-white outline-none placeholder-gray-500"
            />
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="mt-8 rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-10 text-center backdrop-blur-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
            </div>
            <p className="mt-4 text-gray-400">Loading artists...</p>
          </div>
        ) : artists.length === 0 ? (
          /* Empty state */
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

            <h3 className="text-xl font-bold">
              {query.trim() ? "No artists found" : "No artists yet"}
            </h3>
            <p className="mt-2 text-gray-400">
              {query.trim()
                ? "Try a different search term."
                : "Artists will appear here once they join."}
            </p>
          </div>
        ) : (
          /* Artists Grid */
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {artists.map((artist) => (
              <Link
                key={artist._id}
                to={`/listener/artists/${artist._id}`}
                className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-6 text-center backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-violet-500/40 hover:shadow-[0_20px_60px_-15px_rgba(139,92,246,0.4)]"
              >
                {/* Corner glow */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl transition-all duration-500 group-hover:bg-violet-500/25" />

                {/* Avatar with gradient ring */}
                <div className="relative mx-auto h-20 w-20">
                  <div className="absolute inset-0 rounded-full bg-linear-to-br from-violet-500/40 to-fuchsia-500/30 blur-sm transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-violet-500/30 bg-linear-to-br from-violet-500/20 to-fuchsia-500/10 text-violet-300 transition-transform duration-500 group-hover:scale-105">
                    <FaUser className="text-2xl" />
                  </div>
                </div>

                <h2 className="relative mt-4 truncate font-bold transition-colors duration-300 group-hover:text-violet-300">
                  {artist.username}
                </h2>

                <p className="relative mt-1 text-xs text-gray-500 transition-colors duration-300 group-hover:text-violet-400/70">
                  View profile
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
