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

  // useEffect(() => {
  //   const requestId = ++searchRequest.current;
  //   const query = searchQuery.trim();
  //   if (!query) {
  //     setSearchResults(null);
  //     setSearching(false);
  //     return;
  //   }

  //   const timer = setTimeout(async () => {
  //     try {
  //       setSearching(true);

  //       const response = await api.get(
  //         `/music/search?q=${encodeURIComponent(query)}`,
  //       );

  //       if (requestId === searchRequest.current)
  //         setSearchResults(response.data.musics || []);
  //     } catch (error) {
  //       console.error("Search failed:", error);
  //       if (requestId === searchRequest.current) setSearchResults([]);
  //     } finally {
  //       if (requestId === searchRequest.current) setSearching(false);
  //     }
  //   }, 400);

  //   return () => clearTimeout(timer);
  // }, [searchQuery]);

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
    <div className="px-8 py-10">
      <p className="text-sm font-medium text-amber-500">Trending now</p>
      <h1 className="mt-1 text-3xl font-bold">Discover</h1>

      <div className="relative mt-6 max-w-md">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search songs or artists..."
          className="w-full rounded-xl border border-gray-700 bg-gray-900 py-3 pl-11 pr-4 text-white outline-none transition focus:border-amber-500"
        />
      </div>

      {searchResults !== null ? (
        <section className="mt-8">
          <h2 className="mb-6 text-2xl font-bold">
            {searching ? "Searching..." : `Results for "${searchQuery.trim()}"`}
          </h2>

          {!searching && searchResults.length === 0 ? (
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center">
              <p className="text-gray-400">No results found.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
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
          <section className="mt-10">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Recently Added</h2>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center">
                <p className="text-gray-400">Loading music...</p>
              </div>
            ) : musics.length === 0 ? (
              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center">
                <p className="text-gray-400">No music available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {musics.slice(0, 4).map((music) => (
                  <div
                    key={music._id}
                    className="group rounded-2xl bg-gray-900 p-4 transition hover:bg-gray-800"
                  >
                    <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-amber-500/20 to-gray-800">
                      {music.coverImage ? (
                        <img
                          src={music.coverImage}
                          alt={music.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FaMusic className="text-6xl text-amber-500/70" />
                      )}

                      <button
                        onClick={() => handlePlayMusic(music)}
                        className="absolute bottom-3 right-3 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-amber-500 text-gray-950 opacity-0 shadow-xl transition-all group-hover:translate-y-0 group-hover:opacity-100"
                      >
                        <FaPlay className="ml-0.5 text-sm" />
                      </button>
                    </div>

                    <h3 className="mt-4 truncate font-bold">{music.title}</h3>
                    <p className="mt-1 truncate text-sm text-gray-400">
                      {music.artist?.username || "Unknown Artist"}
                    </p>
                    <div className="mt-2">
                      <LikeButton musicId={music._id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-10">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">All Songs</h2>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center">
                <p className="text-gray-400">Loading music...</p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-900 bg-red-950/30 p-8 text-center">
                <p className="text-red-400">{error}</p>
              </div>
            ) : musics.length === 0 ? (
              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center">
                <p className="text-gray-400">No music available yet.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
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

          <section className="mt-10">
            <div className="mb-6 flex items-end justify-between">
              <h2 className="text-2xl font-bold">Browse Albums</h2>

              <NavLink
                to="/listener/album"
                className="flex items-center gap-2 text-sm font-semibold text-gray-400 transition hover:text-amber-500"
              >
                View all
                <FaArrowRight />
              </NavLink>
            </div>
          </section>
        </>
      )}

      {currentMusic && (
        <MusicPlayer music={currentMusic} onClose={handleClosePlayer} />
      )}
    </div>
  );
};
