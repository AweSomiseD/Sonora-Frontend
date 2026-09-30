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
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400">Loading album...</p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <NavLink
            to={albumsPath}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-8"
          >
            <FaArrowLeft />
            Back to Albums
          </NavLink>

          <div className="rounded-2xl border border-red-900 bg-red-950/30 p-10 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Album not found
  if (!album) {
    return (
      <div className="min-h-screen bg-gray-950 text-white px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <NavLink
            to={albumsPath}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-8"
          >
            <FaArrowLeft />
            Back to Albums
          </NavLink>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-10 text-center">
            <p className="text-gray-400">Album not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const songs = album.musics || [];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back */}
        <NavLink
          to={albumsPath}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-8"
        >
          <FaArrowLeft />
          Back to Albums
        </NavLink>

        {/* =========================
            ALBUM HEADER
        ========================== */}

        <section className="rounded-3xl overflow-hidden border border-gray-800 bg-linear-to-br from-amber-500/20 via-gray-900 to-gray-900 p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row gap-8 sm:items-end">
            {/* Album Icon */}

            <div className="w-52 h-52 shrink-0 rounded-2xl bg-gray-800 flex items-center justify-center overflow-hidden shadow-2xl">
              {album.coverImage ? (
                <img
                  src={album.coverImage}
                  alt={album.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FaCompactDisc className="text-8xl text-amber-500" />
              )}
            </div>

            {/* Album Info */}

            <div>
              <p className="text-sm uppercase tracking-widest font-semibold text-amber-500">
                Album
              </p>

              <h1 className="text-4xl sm:text-5xl font-black mt-2">
                {album.title}
              </h1>

              <p className="text-gray-400 mt-4">
                By{" "}
                <span className="text-white font-semibold">
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

              <p className="text-gray-500 text-sm mt-2">
                {songs.length} {songs.length === 1 ? "song" : "songs"}
              </p>

              {/* Play Album */}

              {songs.length > 0 && (
                <button
                  onClick={() => setCurrentMusic(songs[0])}
                  className="mt-6 inline-flex items-center gap-3 rounded-full bg-amber-500 px-6 py-3 font-bold text-gray-950 hover:bg-amber-400 transition"
                >
                  <FaPlay className="text-sm" />
                  Play Album
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
            <p className="text-sm font-medium text-amber-500">Tracklist</p>

            <h2 className="text-3xl font-bold mt-1">Songs</h2>
          </div>

          {songs.length === 0 ? (
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-10 text-center">
              <FaMusic className="text-4xl text-gray-700 mx-auto mb-4" />

              <h3 className="text-xl font-bold">No songs in this album</h3>

              <p className="text-gray-400 mt-2">
                Songs added to this album will appear here.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-gray-800 bg-gray-900">
              {songs.map((song, index) => (
                <div
                  key={song._id}
                  className="flex items-center gap-4 px-4 sm:px-6 py-4 border-b border-gray-800 last:border-b-0 hover:bg-gray-800 transition group"
                >
                  {/* Number */}

                  <div className="w-6 text-center text-gray-500 text-sm">
                    {index + 1}
                  </div>

                  {/* Music Icon */}

                  <div className="w-11 h-11 shrink-0 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <FaMusic />
                  </div>

                  {/* Song Info */}

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate">{song.title}</h3>

                    <p className="text-sm text-gray-400 truncate">
                      {album.artist?.username || "Unknown Artist"}
                    </p>
                  </div>

                  {/* Play */}

                  <button
                    onClick={() => setCurrentMusic(song)}
                    className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-gray-400 hover:bg-amber-500 hover:text-gray-950 transition"
                  >
                    <FaPlay className="text-xs" />
                  </button>
                  <LikeButton musicId={song._id} />
                  {isOwner && (
                    <button
                      onClick={() => handleRemoveFromAlbum(song._id)}
                      disabled={removingId === song._id}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
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
