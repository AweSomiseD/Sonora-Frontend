import { useEffect, useState } from "react";
import { FaClock } from "react-icons/fa";
import api from "../services/api.js";
import { MusicCard } from "../components/MusicCard";
import { MusicPlayer } from "../components/MusicPlayer";

export const RecentlyPlayed = () => {
  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentMusic, setCurrentMusic] = useState(null);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/music/recently-played");

        setMusics(response.data.musics || []);
      } catch (error) {
        console.error("Failed to fetch recently played:", error);
        setError("Unable to load recently played songs.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecent();
  }, []);

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
        @keyframes clockTick {
          0%, 100% { transform: rotate(-8deg); }
          50% { transform: rotate(8deg); }
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
            <FaClock className="text-[10px]" />
            Your History
          </p>

          <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            <span className="bg-linear-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Recently Played
            </span>
          </h1>

          {!loading && !error && musics.length > 0 && (
            <p className="mt-2 text-sm text-gray-400">
              {musics.length} {musics.length === 1 ? "song" : "songs"} in your
              listening history
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
        {!loading && !error && musics.length === 0 && (
          <div className="mt-8 rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-12 text-center backdrop-blur-sm">
            {/* Glowing clock halo */}
            <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-violet-500/15 blur-2xl" />
              <div
                className="absolute inset-2 rounded-full border border-violet-500/20"
                style={{ animation: "clockTick 3s ease-in-out infinite" }}
              />
              <FaClock
                className="relative text-4xl text-violet-400/70"
                style={{ animation: "clockTick 3s ease-in-out infinite" }}
              />
            </div>

            <h3 className="text-xl font-bold">No listening history yet</h3>
            <p className="mt-2 text-gray-400">
              Songs you play will appear here.
            </p>
          </div>
        )}

        {/* Recently Played List */}
        {!loading && !error && musics.length > 0 && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 backdrop-blur-sm">
            {musics.map((music) => (
              <MusicCard
                key={music._id}
                music={music}
                onPlay={setCurrentMusic}
              />
            ))}
          </div>
        )}

        {currentMusic && (
          <MusicPlayer
            music={currentMusic}
            onClose={() => setCurrentMusic(null)}
          />
        )}
      </div>
    </div>
  );
};
