import { useEffect, useState } from "react";
import { FaMusic, FaCompactDisc, FaTrash } from "react-icons/fa";

import api from "../services/api.js";
import { useToast } from "../context/ToastContext";

export const AdminContent = () => {
  const { showToast } = useToast();
  const [tab, setTab] = useState("music"); // "music" | "album"
  const [musics, setMusics] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError("");

        const [musicRes, albumRes] = await Promise.all([
          api.get("/music"),
          api.get("/music/albums"),
        ]);

        setMusics(musicRes.data.musics || []);
        setAlbums(albumRes.data.albums || []);
      } catch (error) {
        console.error("Failed to fetch content:", error);
        setError("Unable to load content.");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const handleDeleteMusic = async (musicId) => {
    setDeletingId(musicId);
    try {
      await api.delete(`/admin/music/${musicId}`);
      setMusics((prev) => prev.filter((m) => m._id !== musicId));
      showToast("Music removed successfully", "success");
    } catch (error) {
      console.error("Failed to delete music:", error);
      showToast(
        error.response?.data?.message || "Failed to delete music.",
        "error",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAlbum = async (albumId) => {
    setDeletingId(albumId);
    try {
      await api.delete(`/admin/album/${albumId}`);
      setAlbums((prev) => prev.filter((a) => a._id !== albumId));
      showToast("Album removed successfully", "success");
    } catch (error) {
      console.error("Failed to delete album:", error);
      showToast(
        error.response?.data?.message || "Failed to delete album.",
        "error",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="px-8 py-10">
      <p className="text-sm font-medium text-amber-500">Moderation</p>
      <h1 className="mt-1 text-3xl font-bold">Content Moderation</h1>

      {/* Tabs */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setTab("music")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            tab === "music"
              ? "bg-amber-500 text-gray-950"
              : "bg-gray-900 text-gray-400 hover:text-white"
          }`}
        >
          Music ({musics.length})
        </button>
        <button
          onClick={() => setTab("album")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            tab === "album"
              ? "bg-amber-500 text-gray-950"
              : "bg-gray-900 text-gray-400 hover:text-white"
          }`}
        >
          Albums ({albums.length})
        </button>
      </div>

      {loading ? (
        <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center">
          <p className="text-gray-400">Loading content...</p>
        </div>
      ) : error ? (
        <div className="mt-8 rounded-2xl border border-red-900 bg-red-950/30 p-8 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      ) : tab === "music" ? (
        musics.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-700 bg-gray-900 p-10 text-center">
            <FaMusic className="mx-auto text-4xl text-gray-700" />
            <h3 className="mt-4 text-xl font-bold">No music on platform</h3>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
            {musics.map((music, index) => (
              <div
                key={music._id}
                className="flex items-center gap-4 border-b border-gray-800 p-4 last:border-b-0 hover:bg-gray-800/70"
              >
                <span className="w-6 text-center text-sm text-gray-500">
                  {index + 1}
                </span>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <FaMusic />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{music.title}</h3>
                  <p className="truncate text-sm text-gray-500">
                    {music.artist?.username || "Unknown Artist"}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteMusic(music._id)}
                  disabled={deletingId === music._id}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                >
                  <FaTrash className="text-sm" />
                </button>
              </div>
            ))}
          </div>
        )
      ) : albums.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-700 bg-gray-900 p-10 text-center">
          <FaCompactDisc className="mx-auto text-4xl text-gray-700" />
          <h3 className="mt-4 text-xl font-bold">No albums on platform</h3>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <div
              key={album._id}
              className="relative rounded-2xl border border-gray-800 bg-gray-900 p-5"
            >
              <button
                onClick={() => handleDeleteAlbum(album._id)}
                disabled={deletingId === album._id}
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-950/80 text-gray-400 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
              >
                <FaTrash className="text-xs" />
              </button>
              <div className="flex aspect-square items-center justify-center rounded-xl bg-linear-to-br from-amber-500/20 via-gray-800 to-gray-900">
                <FaCompactDisc className="text-7xl text-amber-500/70" />
              </div>
              <div className="mt-5">
                <h3 className="truncate text-lg font-bold">{album.title}</h3>
                <p className="mt-1 text-sm text-gray-400">
                  {album.artist?.username || "Unknown Artist"} ·{" "}
                  {album.musics?.length || 0}{" "}
                  {album.musics?.length === 1 ? "Song" : "Songs"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
