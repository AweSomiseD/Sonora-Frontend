import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMusic,
  FaCloudUploadAlt,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";
import { useToast } from "../context/ToastContext";
import { validateFile } from "../utils/fileValidation.js";

import api from "../services/api.js";

export const CreateMusic = () => {
  const [coverImage, setCoverImage] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [musicFile, setMusicFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Title validation
    if (!title.trim()) {
      setError("Music title is required.");
      return;
    }

    // File validation (defense-in-depth — re-checked even though
    // onChange already validated at selection time)
    const validation = validateFile(musicFile, "audio");

    if (!validation.valid) {
      showToast(validation.message, "error");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("music", musicFile);
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      console.log("Uploading music:", {
        title,
        file: musicFile.name,
      });

      const response = await api.post("/music/upload", formData);

      console.log("Music Upload Response:", response.data);

      setSuccess(response.data?.message || "Music uploaded successfully!");

      // Clear form
      setTitle("");
      setMusicFile(null);
      setCoverImage(null);
      // reset file input values to allow re-uploading the same file if needed
      document.getElementById("music-file").value = "";
      if (document.getElementById("cover-image")) {
        document.getElementById("cover-image").value = "";
      }
    } catch (error) {
      console.error("Music upload failed:", error);

      if (error.response?.status === 401) {
        setError("You are not authenticated. Please login again.");
      } else if (error.response?.status === 403) {
        setError("Only artists can upload music.");
      } else {
        setError(error.response?.data?.message || "Failed to upload music.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
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

          <h1 className="mt-2 text-4xl font-black sm:text-5xl">Upload Music</h1>

          <p className="mt-3 text-gray-400">
            Upload your track and share it with listeners.
          </p>
        </div>

        {/* Form Card */}

        <div className="rounded-3xl border border-gray-800 bg-gray-900 p-6 shadow-2xl sm:p-8">
          {/* Success */}

          {success && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-800 bg-green-950/30 p-4 text-green-400">
              <FaCheckCircle className="mt-0.5 shrink-0" />

              <p>{success}</p>
            </div>
          )}

          {/* Error */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-800 bg-red-950/30 p-4 text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}

            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-gray-300"
              >
                Music Title
              </label>

              <div className="relative">
                <FaMusic className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />

                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter song title"
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-700 bg-gray-950 py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div>
                <label
                  htmlFor="cover-image"
                  className="mb-2 block text-sm font-semibold text-gray-300"
                >
                  Cover Image <span className="text-gray-600">(optional)</span>
                </label>

                <input
                  id="cover-image"
                  type="file"
                  accept="image/*"
                  disabled={loading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const validation = validateFile(file, "image");
                    if (!validation.valid) {
                      showToast(validation.message, "error");
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

            {/* Music File */}

            <div>
              <label
                htmlFor="music-file"
                className="mb-2 block text-sm font-semibold text-gray-300"
              >
                Music File
              </label>

              <label
                htmlFor="music-file"
                className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-700 bg-gray-950/50 px-6 py-12 text-center transition hover:border-amber-500/60 hover:bg-amber-500/5"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 transition group-hover:scale-110">
                  <FaCloudUploadAlt className="text-3xl" />
                </div>

                {musicFile ? (
                  <>
                    <p className="font-semibold text-white">{musicFile.name}</p>

                    <p className="mt-2 text-sm text-gray-500">
                      {(musicFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>

                    <p className="mt-3 text-sm text-amber-500">
                      Click to choose another file
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-white">
                      Choose your music file
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      Click here to browse your computer
                    </p>

                    <p className="mt-3 text-xs text-gray-600">
                      MP3, WAV, or M4A — up to 5 MB
                    </p>
                  </>
                )}

                <input
                  id="music-file"
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  disabled={loading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (!file) return;

                    const validation = validateFile(file, "audio");

                    if (!validation.valid) {
                      showToast(validation.message, "error");
                      e.target.value = ""; // Reset the file input
                      setMusicFile(null);
                      return;
                    }

                    setMusicFile(file);
                    setError(""); // Clear any previous error
                  }}
                />
              </label>
            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-amber-500 px-6 py-4 font-bold text-gray-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-950 border-t-transparent" />
                  Uploading...
                </>
              ) : (
                <>
                  <FaCloudUploadAlt />
                  Upload Music
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
