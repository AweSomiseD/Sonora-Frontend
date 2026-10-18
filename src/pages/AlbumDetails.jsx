import { useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import {
  FaArrowLeft,
  FaPlay,
  FaMusic,
  FaCompactDisc,
  FaTimes,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { getDashboardChildPath } from "../routes/routePaths.js";
import { FollowButton } from "../components/FollowButton";
import { LikeButton } from "../components/LikeButton";

import api from "../services/api.js";
import { MusicPlayer } from "../components/MusicPlayer.jsx";

export const AlbumDetails = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const albumsPath = getDashboardChildPath(user?.role, "album");

  const [album, setAlbum] = useState(null);
  const [currentMusic, setCurrentMusic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [removingId, setRemovingId] = useState(null);

  const isOwner = album?.artist?._id === (user?._id || user?.id);

  const handleRemoveFromAlbum = async (musicId) => {
    setRemovingId(musicId);

    try {
      const response = await api.delete(`/music/album/${id}/music/${musicId}`);
      setAlbum(response.data.album);
    } catch (error) {
      console.error("Failed to remove song from album:", error);
    } finally {
      setRemovingId(null);
    }
  };

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/music/albums/${id}`);

        console.log("Album Details Response:", response.data);

        setAlbum(response.data.album);
      } catch (error) {
        console.error("Failed to fetch album:", error);

        setError(error.response?.data?.message || "Unable to load album.");
      } finally {
        setLoading(false);
      }
    };

    fetchAlbum();
  }, [id]);

  // Loading
  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-950 text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-20 h-96 w-96 animate-pulse rounded-full bg-violet-500/10 blur-[120px]" />
          <div
            className="absolute -right-40 bottom-20 h-96 w-96 animate-pulse rounded-full bg-fuchsia-600/8 blur-[120px]"
            style={{ animationDelay: "1.5s" }}
          />
        </div>

        <div className="relative z-10 text-center">
          <FaCompactDisc
            className="mx-auto mb-4 text-4xl text-violet-400"
            style={{ animation: "spin 2s linear infinite" }}
          />
          <p className="text-gray-400">Loading album...</p>
        </div>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gray-950 px-4 py-10 text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-20 h-96 w-96 animate-pulse rounded-full bg-violet-500/10 blur-[120px]" />
          <div
            className="absolute -right-40 bottom-20 h-96 w-96 animate-pulse rounded-full bg-fuchsia-600/8 blur-[120px]"
            style={{ animationDelay: "1.5s" }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl">
          <NavLink
            to={albumsPath}
            className="group mb-8 inline-flex items-center gap-2 rounded-full border border-gray-700/50 bg-gray-900/50 px-4 py-2 text-sm text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/50 hover:bg-violet-500/5 hover:text-violet-300"
          >
            <FaArrowLeft className="text-xs transition-transform duration-300 group-hover:-translate-x-0.5" />
            Back to Albums
          </NavLink>

          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-10 text-center backdrop-blur-sm">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Album not found
  if (!album) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gray-950 px-4 py-10 text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-20 h-96 w-96 animate-pulse rounded-full bg-violet-500/10 blur-[120px]" />
          <div
            className="absolute -right-40 bottom-20 h-96 w-96 animate-pulse rounded-full bg-fuchsia-600/8 blur-[120px]"
            style={{ animationDelay: "1.5s" }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl">
          <NavLink
            to={albumsPath}
            className="group mb-8 inline-flex items-center gap-2 rounded-full border border-gray-700/50 bg-gray-900/50 px-4 py-2 text-sm text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/50 hover:bg-violet-500/5 hover:text-violet-300"
          >
            <FaArrowLeft className="text-xs transition-transform duration-300 group-hover:-translate-x-0.5" />
            Back to Albums
          </NavLink>

          <div className="rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-10 text-center backdrop-blur-sm">
            <p className="text-gray-400">Album not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const songs = album.musics || [];

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
        {/* Back */}
        <NavLink
          to={albumsPath}
          className="group mb-8 inline-flex items-center gap-2 rounded-full border border-gray-700/50 bg-gray-900/50 px-4 py-2 text-sm text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/50 hover:bg-violet-500/5 hover:text-violet-300"
        >
          <FaArrowLeft className="text-xs transition-transform duration-300 group-hover:-translate-x-0.5" />
          Back to Albums
        </NavLink>

        {/* =========================
            ALBUM HEADER
        ========================== */}
        <section className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-linear-to-br from-violet-500/20 via-fuchsia-500/10 to-gray-950 p-6 shadow-[0_20px_60px_-15px_rgba(139,92,246,0.3)] sm:p-10">
          {/* Decorative glow orbs */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-fuchsia-500/15 blur-3xl" />

          <div className="relative flex flex-col gap-8 sm:flex-row sm:items-end">
            {/* Album Cover / Icon */}
            <div className="group relative h-52 w-52 shrink-0 overflow-hidden rounded-2xl border border-violet-500/30 bg-linear-to-br from-violet-500/30 via-fuchsia-500/20 to-gray-900 shadow-2xl">
              {album.coverImage ? (
                <img
                  src={album.coverImage}
                  alt={album.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <FaCompactDisc
                    className="text-8xl text-violet-300/80 transition-colors duration-500 group-hover:text-violet-200"
                    style={{ animation: "spinSlow 20s linear infinite" }}
                  />
                </div>
              )}
            </div>

            {/* Album Info */}
            <div className="min-w-0 flex-1">
              <p className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300 backdrop-blur-sm">
                <FaCompactDisc className="text-[10px]" />
                Album
              </p>

              <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                <span className="bg-linear-to-r from-white via-violet-100 to-fuchsia-100 bg-clip-text text-transparent">
                  {album.title}
                </span>
              </h1>

              <p className="mt-4 text-gray-300">
                By{" "}
                <span className="font-semibold text-white">
                  {album.artist?.username || "Unknown Artist"}
                </span>
              </p>

              {(album.artist?._id || album.musics?.[0]?.artist?._id) && (
                <div className="mt-4">
                  <FollowButton
                    artistId={
                      album.artist?._id || album.musics?.[0]?.artist?._id
                    }
                  />
                </div>
              )}

              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-gray-950/40 px-3 py-1 text-xs text-gray-400 backdrop-blur-sm">
                <FaMusic className="text-[10px] text-violet-400" />
                {songs.length} {songs.length === 1 ? "song" : "songs"}
              </p>

              {/* Play Album */}
              {songs.length > 0 && (
                <button
                  onClick={() => setCurrentMusic(songs[0])}
                  className="group relative mt-6 inline-flex items-center gap-3 overflow-hidden rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 px-7 py-3.5 font-bold text-white shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.7)]"
                >
                  <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <FaPlay className="relative text-sm transition-transform duration-300 group-hover:scale-110" />
                  <span className="relative">Play Album</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* =========================
            TRACKLIST
        ========================== */}
        <section className="mt-10">
          <div className="mb-6">
            <p className="text-sm font-medium text-violet-400">Tracklist</p>

            <h2 className="mt-1 text-3xl font-bold">
              <span className="relative">
                Songs
                <span className="absolute -bottom-2 left-0 h-0.5 w-12 rounded-full bg-linear-to-r from-violet-500 to-transparent" />
              </span>
            </h2>
          </div>

          {songs.length === 0 ? (
            <div className="rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-10 text-center backdrop-blur-sm">
              <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-violet-500/10 blur-2xl" />
                <FaMusic className="relative text-4xl text-violet-500/40" />
              </div>

              <h3 className="text-xl font-bold">No songs in this album</h3>

              <p className="mt-2 text-gray-400">
                Songs added to this album will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 backdrop-blur-sm">
              {songs.map((song, index) => (
                <div
                  key={song._id}
                  className="group flex items-center gap-3 border-b border-gray-800/50 px-4 py-4 transition-colors duration-300 last:border-b-0 hover:bg-violet-500/5 sm:gap-4 sm:px-6"
                >
                  {/* Number */}
                  <div className="w-6 text-center text-sm text-gray-500 transition-colors duration-300 group-hover:text-violet-400">
                    {index + 1}
                  </div>

                  {/* Music Icon */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-violet-500/20 to-fuchsia-500/10 text-violet-400 transition-all duration-300 group-hover:scale-105 group-hover:text-violet-300">
                    <FaMusic />
                  </div>

                  {/* Song Info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold transition-colors duration-300 group-hover:text-violet-200">
                      {song.title}
                    </h3>

                    <p className="truncate text-sm text-gray-400">
                      {album.artist?.username || "Unknown Artist"}
                    </p>
                  </div>

                  {/* Play */}
                  <button
                    onClick={() => setCurrentMusic(song)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-400 transition-all duration-300 hover:scale-110 hover:bg-linear-to-br hover:from-violet-500 hover:to-fuchsia-500 hover:text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]"
                  >
                    <FaPlay className="ml-0.5 text-xs" />
                  </button>

                  <LikeButton musicId={song._id} />

                  {isOwner && (
                    <button
                      onClick={() => handleRemoveFromAlbum(song._id)}
                      disabled={removingId === song._id}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition-all duration-300 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                      title="Remove from album"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Music Player */}
      {currentMusic && (
        <MusicPlayer
          music={currentMusic}
          onClose={() => setCurrentMusic(null)}
        />
      )}
    </div>
  );
};
