import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCompactDisc,
  FaMusic,
  FaCheckCircle,
} from "react-icons/fa";
import { validateFile } from "../utils/fileValidation.js";
import api from "../services/api.js";

export const CreateAlbum = () => {
  const [coverImage, setCoverImage] = useState(null);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [musics, setMusics] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ========================================
  // Fetch Available Music
  // ========================================

  useEffect(() => {
    const fetchMusics = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/music/my-music");

        console.log("Music Response:", response.data);

        setMusics(response.data.musics || []);
      } catch (error) {
        console.error("Failed to fetch music:", error);

        setError(error.response?.data?.message || "Unable to load music.");
      } finally {
        setLoading(false);
      }
    };

    fetchMusics();
  }, []);

  // ========================================
  // Toggle Music Selection
  // ========================================

  const handleMusicSelect = (musicId) => {
    setMusics((prevMusics) =>
      prevMusics.map((music) =>
        music._id === musicId
          ? {
              ...music,
              selected: !music.selected,
            }
          : music,
      ),
    );
  };

  // ========================================
  // Create Album
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Album title is required.");
      return;
    }

    const selectedMusicIds = musics
      .filter((music) => music.selected)
      .map((music) => music._id);

    if (selectedMusicIds.length === 0) {
      setError("Please select at least one song.");
      return;
    }

    try {
      setCreating(true);
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("musics", JSON.stringify(selectedMusicIds));
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      const response = await api.post("/music/album", formData);

      console.log("Create Album Response:", response.data);

      setSuccess(response.data?.message || "Album created successfully!");

      setTitle("");
      setCoverImage(null);

      // Clear selected songs
      setMusics((prevMusics) =>
        prevMusics.map((music) => ({
          ...music,
          selected: false,
        })),
      );
    } catch (error) {
      console.error("Album creation failed:", error);

      if (error.response?.status === 401) {
        setError("You are not authenticated. Please login again.");
      } else if (error.response?.status === 403) {
        setError("Only artists can create albums.");
      } else {
        setError(error.response?.data?.message || "Failed to create album.");
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back */}

        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
        >
          <FaArrowLeft />
          Back
        </button>

        {/* Header */}

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
            Artist Studio
          </p>

          <h1 className="mt-2 text-4xl font-black sm:text-5xl">Create Album</h1>

          <p className="mt-3 text-gray-400">
            Create an album and add your uploaded songs to it.
          </p>
        </div>

        {/* Main Card */}

        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-6 shadow-2xl sm:p-8">
          {/* Success */}

          {success && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-800 bg-green-950/30 p-4 text-green-400">
              <FaCheckCircle />

              <p>{success}</p>
            </div>
          )}

          {/* Error */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-800 bg-red-950/30 p-4 text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Album Title */}

            <div>
              <label
                htmlFor="album-title"
                className="mb-2 block text-sm font-semibold text-gray-300"
              >
                Album Title
              </label>

              <div className="relative">
                <FaCompactDisc className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />

                <input
                  id="album-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter album title"
                  disabled={creating}
                  className="w-full rounded-xl border border-gray-700 bg-gray-950 py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div>
                <label
                  htmlFor="album-cover"
                  className="mb-2 block text-sm font-semibold text-gray-300"
                >
                  Cover Image <span className="text-gray-600">(optional)</span>
                </label>

                <input
                  id="album-cover"
                  type="file"
                  accept="image/*"
                  disabled={creating}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const validation = validateFile(file, "image");
                    if (!validation.valid) {
                      setError(validation.message);
                      e.target.value = "";
                      setCoverImage(null);
                      return;
                    }
                    setCoverImage(file);
                  }}
                  className="w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-gray-300 outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-amber-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-950 hover:file:bg-amber-400"
                />
              </div>
            </div>

            {/* Select Music */}

            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Select Songs</h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Select the songs you want to add to this album.
                  </p>
                </div>

                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-500">
                  {musics.filter((music) => music.selected).length} selected
                </span>
              </div>

              {/* Loading */}

              {loading && (
                <div className="rounded-2xl border border-gray-800 bg-gray-950 p-8 text-center">
                  <p className="text-gray-400">Loading your music...</p>
                </div>
              )}

              {/* No Music */}

              {!loading && musics.length === 0 && (
                <div className="rounded-2xl border border-gray-800 bg-gray-950 p-8 text-center">
                  <FaMusic className="mx-auto mb-4 text-4xl text-gray-700" />

                  <h3 className="font-bold">No music available</h3>

                  <p className="mt-2 text-sm text-gray-500">
                    Upload some music before creating an album.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/create-music")}
                    className="mt-5 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-gray-950 hover:bg-amber-400"
                  >
                    Upload Music
                  </button>
                </div>
              )}

              {/* Music List */}

              {!loading && musics.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-gray-800">
                  {musics.map((music) => (
                    <label
                      key={music._id}
                      className={`flex cursor-pointer items-center gap-4 border-b border-gray-800 px-4 py-4 last:border-b-0 transition ${
                        music.selected
                          ? "bg-amber-500/10"
                          : "bg-gray-950 hover:bg-gray-800"
                      }`}
                    >
                      {/* Checkbox */}

                      <input
                        type="checkbox"
                        checked={music.selected || false}
                        onChange={() => handleMusicSelect(music._id)}
                        disabled={creating}
                        className="h-5 w-5 accent-amber-500"
                      />

                      {/* Icon */}

                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                          music.selected
                            ? "bg-amber-500 text-gray-950"
                            : "bg-gray-800 text-amber-500"
                        }`}
                      >
                        <FaMusic />
                      </div>

                      {/* Details */}

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold">
                          {music.title}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {music.artist?.username || "Music"}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={creating || loading || musics.length === 0}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-amber-500 px-6 py-4 font-bold text-gray-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-950 border-t-transparent" />
                  Creating Album...
                </>
              ) : (
                <>
                  <FaCompactDisc />
                  Create Album
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
