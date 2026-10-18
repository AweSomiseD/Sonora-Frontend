import { NavLink } from "react-router-dom";
import { FaPlay, FaMusic, FaArrowRight, FaSearch } from "react-icons/fa";
import { useEffect, useRef, useState, useMemo } from "react";
import debounce from "debounce";

import api from "../services/api.js";
import { MusicCard } from "../components/MusicCard";
import { MusicPlayer } from "../components/MusicPlayer";
import { LikeButton } from "../components/LikeButton";

export const Discover = () => {
  const [musics, setMusics] = useState([]);
  const [currentMusic, setCurrentMusic] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const searchRequest = useRef(0);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query, requestId) => {
        try {
          setSearching(true);

          const response = await api.get(
            `/music/search?q=${encodeURIComponent(query)}`,
          );

          if (requestId === searchRequest.current)
            setSearchResults(response.data.musics || []);
        } catch (error) {
          console.error("Search failed:", error);
          if (requestId === searchRequest.current) setSearchResults([]);
        } finally {
          if (requestId === searchRequest.current) setSearching(false);
        }
      }, 500),
    [],
  );

  useEffect(() => {
    const fetchMusics = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/music");

        setMusics(response.data.musics || []);
      } catch (error) {
        console.error("Failed to fetch music:", error);
        setError("Unable to load music.");
      } finally {
        setLoading(false);
      }
    };

    fetchMusics();
  }, []);

  useEffect(() => {
    const requestId = ++searchRequest.current;
    const query = searchQuery.trim();

    if (!query) {
      debouncedSearch.clear();
      setSearchResults(null);
      setSearching(false);
      return;
    }

    debouncedSearch(query, requestId);

    return () => debouncedSearch.clear();
  }, [searchQuery, debouncedSearch]);

  const handlePlayMusic = (music) => setCurrentMusic(music);
  const handleClosePlayer = () => setCurrentMusic(null);

  return (
    <div className="relative min-h-screen">
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
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.6);
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
            Trending now
          </p>

          <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            <span className="bg-linear-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Discover
            </span>
          </h1>
        </div>

        {/* Search Bar */}
        <div
          className="relative mt-6 max-w-md rounded-xl p-px transition-all duration-300"
          style={{ animation: "searchGlow 4s ease-in-out infinite" }}
        >
          {/* Gradient border */}
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
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search songs or artists..."
              className="w-full rounded-xl bg-transparent py-3 pl-11 pr-4 text-white outline-none placeholder-gray-500"
            />
          </div>
        </div>

        {searchResults !== null ? (
          <section className="mt-10">
            <div className="mb-6 flex items-center gap-3">
              <h2 className="text-2xl font-bold">
                {searching ? (
                  <span className="text-violet-300">Searching...</span>
                ) : (
                  <>
                    Results for{" "}
                    <span className="bg-linear-to-r from-violet-300 via-fuchsia-300 to-purple-300 bg-clip-text text-transparent">
                      "{searchQuery.trim()}"
                    </span>
                  </>
                )}
              </h2>
              {searching && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-violet-500" />
                </span>
              )}
            </div>

            {!searching && searchResults.length === 0 ? (
              <div className="rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-10 text-center backdrop-blur-sm">
                <FaSearch className="mx-auto text-3xl text-violet-500/40" />
                <p className="mt-3 text-gray-400">No results found.</p>
                <p className="mt-1 text-sm text-gray-500">
                  Try a different keyword or artist name.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 backdrop-blur-sm">
                {searchResults.map((music) => (
                  <MusicCard
                    key={music._id}
                    music={music}
                    onPlay={handlePlayMusic}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            {/* Recently Added */}
            <section className="mt-10">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  <span className="relative">
                    Recently Added
                    <span className="absolute -bottom-2 left-0 h-0.5 w-12 rounded-full bg-linear-to-r from-violet-500 to-transparent" />
                  </span>
                </h2>
              </div>

              {loading ? (
                <div className="rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-10 text-center backdrop-blur-sm">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
                  </div>
                  <p className="mt-4 text-gray-400">Loading music...</p>
                </div>
              ) : musics.length === 0 ? (
                <div className="rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-10 text-center backdrop-blur-sm">
                  <FaMusic className="mx-auto text-3xl text-violet-500/40" />
                  <p className="mt-3 text-gray-400">No music available yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                  {musics.slice(0, 4).map((music) => (
                    <div
                      key={music._id}
                      className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-4 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-[0_20px_60px_-15px_rgba(139,92,246,0.4)]"
                    >
                      {/* Corner glow */}
                      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl transition-all duration-500 group-hover:bg-violet-500/25" />

                      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-violet-500/20 via-fuchsia-500/10 to-gray-800">
                        {music.coverImage ? (
                          <img
                            src={music.coverImage}
                            alt={music.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <FaMusic className="text-6xl text-violet-400/70" />
                        )}

                        {/* Gradient overlay on hover */}
                        <div className="absolute inset-0 bg-linear-to-t from-gray-950/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                        <button
                          onClick={() => handlePlayMusic(music)}
                          className="absolute bottom-3 right-3 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 text-white opacity-0 shadow-[0_0_25px_rgba(139,92,246,0.6)] transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-110"
                        >
                          <FaPlay className="ml-0.5 text-sm" />
                        </button>
                      </div>

                      <h3 className="relative mt-4 truncate font-bold transition-colors duration-300 group-hover:text-violet-300">
                        {music.title}
                      </h3>
                      <p className="relative mt-1 truncate text-sm text-gray-400">
                        {music.artist?.username || "Unknown Artist"}
                      </p>
                      <div className="relative mt-2">
                        <LikeButton musicId={music._id} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* All Songs */}
            <section className="mt-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">
                  <span className="relative">
                    All Songs
                    <span className="absolute -bottom-2 left-0 h-0.5 w-12 rounded-full bg-linear-to-r from-violet-500 to-transparent" />
                  </span>
                </h2>
              </div>

              {loading ? (
                <div className="rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-10 text-center backdrop-blur-sm">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
                  </div>
                  <p className="mt-4 text-gray-400">Loading music...</p>
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-10 text-center backdrop-blur-sm">
                  <p className="text-red-400">{error}</p>
                </div>
              ) : musics.length === 0 ? (
                <div className="rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-10 text-center backdrop-blur-sm">
                  <FaMusic className="mx-auto text-3xl text-violet-500/40" />
                  <p className="mt-3 text-gray-400">No music available yet.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 backdrop-blur-sm">
                  {musics.map((music) => (
                    <MusicCard
                      key={music._id}
                      music={music}
                      onPlay={handlePlayMusic}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Browse Albums */}
            <section className="mt-12 mb-6">
              <div className="flex items-end justify-between">
                <h2 className="text-2xl font-bold">
                  <span className="relative">
                    Browse Albums
                    <span className="absolute -bottom-2 left-0 h-0.5 w-12 rounded-full bg-linear-to-r from-violet-500 to-transparent" />
                  </span>
                </h2>

                <NavLink
                  to="/listener/album"
                  className="group flex items-center gap-2 rounded-full border border-gray-700/50 bg-gray-900/50 px-4 py-2 text-sm font-semibold text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/50 hover:bg-violet-500/5 hover:text-violet-300"
                >
                  View all
                  <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
                </NavLink>
              </div>
            </section>
          </>
        )}

        {currentMusic && (
          <MusicPlayer music={currentMusic} onClose={handleClosePlayer} />
        )}
      </div>
    </div>
  );
};
