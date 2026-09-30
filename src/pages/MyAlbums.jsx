import { useEffect, useState } from "react";
import {
  FaCompactDisc,
  FaArrowRight,
  FaTrash,
  FaEdit,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

import api from "../services/api.js";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getDashboardChildPath } from "../routes/routePaths.js";
import { useNavigate } from "react-router-dom";

export const MyAlbums = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [savingId, setSavingId] = useState(null);

  const startEdit = (e, album) => {
    e.stopPropagation();
    setEditingId(album._id);
    setEditTitle(album.title);
  };

  const cancelEdit = (e) => {
    e?.stopPropagation();
    setEditingId(null);
    setEditTitle("");
  };

  const saveEdit = async (e, albumId) => {
    e.stopPropagation();
    if (!editTitle.trim()) {
      showToast("Title cannot be empty", "error");
      return;
    }

    setSavingId(albumId);

    try {
      const response = await api.patch(`/music/album/${albumId}`, {
        title: editTitle.trim(),
      });
      setAlbums((prev) =>
        prev.map((a) => (a._id === albumId ? response.data.album : a)),
      );
      showToast("Album updated successfully", "success");
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update album:", error);
      showToast(
        error.response?.data?.message || "Failed to update album.",
        "error",
      );
    } finally {
      setSavingId(null);
    }
  };

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/music/my-albums");

        setAlbums(response.data.albums || []);
      } catch (error) {
        console.error("Failed to fetch artist albums:", error);
        setError("Unable to load your albums.");
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  const handleDelete = async (albumId) => {
    setDeletingId(albumId);

    try {
      await api.delete(`/music/album/${albumId}`);
      setAlbums((prev) => prev.filter((a) => a._id !== albumId));
      showToast("Album deleted successfully", "success");
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
      <p className="text-sm font-medium text-amber-500">Your Releases</p>
      <h1 className="mt-1 text-3xl font-bold">My Albums</h1>

      {loading ? (
        <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center">
          <p className="text-gray-400">Loading your albums...</p>
        </div>
      ) : error ? (
        <div className="mt-8 rounded-2xl border border-red-900 bg-red-950/30 p-8 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      ) : albums.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-700 bg-gray-900 p-10 text-center">
          <FaCompactDisc className="mx-auto text-4xl text-gray-700" />
          <h3 className="mt-4 text-xl font-bold">No albums created yet</h3>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <div
              key={album._id}
              className="group relative cursor-pointer rounded-2xl border border-gray-800 bg-gray-900 p-5 transition hover:-translate-y-1 hover:border-amber-500/50"
              onClick={() =>
                navigate(getDashboardChildPath(user.role, `album/${album._id}`))
              }
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(album._id);
                }}
                disabled={deletingId === album._id}
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-950/80 text-gray-400 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
              >
                <FaTrash className="text-xs" />
              </button>

              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-amber-500/20 via-gray-800 to-gray-900">
                {album.coverImage ? (
                  <img
                    src={album.coverImage}
                    alt={album.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FaCompactDisc className="text-7xl text-amber-500/70" />
                )}
              </div>

              <div className="mt-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="min-w-0">
                    {editingId === album._id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(e, album._id);
                          if (e.key === "Escape") cancelEdit(e);
                        }}
                        className="w-full rounded-lg border border-amber-500 bg-gray-950 px-2 py-1 text-sm outline-none"
                      />
                    ) : (
                      <h3 className="truncate text-lg font-bold">
                        {album.title}
                      </h3>
                    )}
                    <p className="mt-1 text-sm text-gray-400">
                      {album.musics?.length || 0}{" "}
                      {album.musics?.length === 1 ? "Song" : "Songs"}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-gray-400">
                    {album.musics?.length || 0}{" "}
                    {album.musics?.length === 1 ? "Song" : "Songs"}
                  </p>
                </div>
                {editingId === album._id ? (
                  <div className="absolute right-4 top-4 z-10 flex gap-2">
                    <button
                      onClick={(e) => saveEdit(e, album._id)}
                      disabled={savingId === album._id}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-950/80 text-green-500 hover:bg-green-500 hover:text-white disabled:opacity-50"
                    >
                      <FaCheck className="text-xs" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-950/80 text-gray-400 hover:bg-gray-700"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </div>
                ) : (
                  <div className="absolute right-4 top-4 z-10 flex gap-2">
                    <button
                      onClick={(e) => startEdit(e, album)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-950/80 text-gray-400 hover:bg-amber-500 hover:text-gray-950"
                    >
                      <FaEdit className="text-xs" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(album._id);
                      }}
                      disabled={deletingId === album._id}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-950/80 text-gray-400 hover:bg-red-500 hover:text-white disabled:opacity-50"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                )}

                <FaArrowRight className="mt-1 shrink-0 text-gray-600 transition group-hover:translate-x-1 group-hover:text-amber-500" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
