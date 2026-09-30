import { useEffect, useState } from "react";
import {
  FaMusic,
  FaPlay,
  FaTrash,
  FaEdit,
  FaCheck,
  FaTimes,
  FaHeadphones,
} from "react-icons/fa";

import api from "../services/api.js";
import { MusicPlayer } from "../components/MusicPlayer";
import { useToast } from "../context/ToastContext";

export const MyMusic = () => {
  const { showToast } = useToast();
  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentMusic, setCurrentMusic] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/music/my-music");

        setMusics(response.data.musics || []);
      } catch (error) {
        console.error("Failed to fetch artist music:", error);
        setError("Unable to load your music.");
      } finally {
        setLoading(false);
      }
    };

    fetchMusic();
  }, []);

  const handleDelete = async (musicId) => {
    setDeletingId(musicId);

    try {
      await api.delete(`/music/${musicId}`);
      setMusics((prev) => prev.filter((m) => m._id !== musicId));
      showToast("Music deleted successfully", "success");
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

  const startEdit = (music) => {
    setEditingId(music._id);
    setEditTitle(music.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const saveEdit = async (musicId) => {
    if (!editTitle.trim()) {
      showToast("Title cannot be empty", "error");
      return;
    }

    setSavingId(musicId);

    try {
      const response = await api.patch(`/music/${musicId}`, {
        title: editTitle.trim(),
      });
      setMusics((prev) =>
        prev.map((m) => (m._id === musicId ? response.data.music : m)),
      );
      showToast("Music updated successfully", "success");
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update music:", error);
      showToast(
        error.response?.data?.message || "Failed to update music.",
        "error",
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="px-8 py-10">
      <p className="text-sm font-medium text-amber-500">Your Collection</p>
      <h1 className="mt-1 text-3xl font-bold">My Music</h1>

      {loading ? (
        <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center">
          <p className="text-gray-400">Loading your music...</p>
        </div>
      ) : error ? (
        <div className="mt-8 rounded-2xl border border-red-900 bg-red-950/30 p-8 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      ) : musics.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-700 bg-gray-900 p-10 text-center">
          <FaMusic className="mx-auto text-4xl text-gray-700" />
          <h3 className="mt-4 text-xl font-bold">No music uploaded yet</h3>
          <p className="mt-2 text-gray-400">
            Upload your first song to see it here.
          </p>
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

              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-amber-500/10 text-amber-500">
                {music.coverImage ? (
                  <img
                    src={music.coverImage}
                    alt={music.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FaMusic />
                )}
              </div>

              <div className="min-w-0 flex-1">
                {editingId === music._id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(music._id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                    className="w-full rounded-lg border border-amber-500 bg-gray-950 px-3 py-1.5 text-sm outline-none"
                  />
                ) : (
                  <h3 className="truncate font-semibold">{music.title}</h3>
                )}
              </div>
              <div className="min-w-0 flex-1">
                {editingId === music._id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(music._id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                    className="w-full rounded-lg border border-amber-500 bg-gray-950 px-3 py-1.5 text-sm outline-none"
                  />
                ) : (
                  <>
                    <h3 className="truncate font-semibold">{music.title}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                      <FaHeadphones className="text-[10px]" />
                      {music.playCount ?? 0}{" "}
                      {music.playCount === 1 ? "play" : "plays"}
                    </p>
                  </>
                )}
              </div>
              {editingId === music._id ? (
                <>
                  <button
                    onClick={() => saveEdit(music._id)}
                    disabled={savingId === music._id}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-green-500 transition hover:bg-green-500/10 disabled:opacity-50"
                  >
                    <FaCheck className="text-sm" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-800"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => startEdit(music)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-amber-500/10 hover:text-amber-500"
                >
                  <FaEdit className="text-sm" />
                </button>
              )}

              <button
                onClick={() => setCurrentMusic(music)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-gray-950 transition hover:bg-amber-400"
              >
                <FaPlay className="ml-0.5 text-sm" />
              </button>
              <button
                onClick={() => handleDelete(music._id)}
                disabled={deletingId === music._id}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
              >
                <FaTrash className="text-sm" />
              </button>
            </div>
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
  );
};
