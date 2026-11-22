import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCloudUploadAlt, FaFileAudio, FaImage } from "react-icons/fa";
import { Button, Card, Input, PageHeader, Select } from "../components/ui/index.jsx";
import { GENRES, genreLabel } from "../constants/index.js";
import { useToast } from "../context/ToastContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import api, { getErrorMessage } from "../services/api.js";
import { FILE_TYPE_CONFIG, validateFile } from "../utils/fileValidation.js";

function FilePicker({ id, label, icon: Icon, accept, file, onChange, hint, error }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-300">
        {label}
      </label>
      <label
        htmlFor={id}
        className={`flex min-h-24 cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed px-4 py-4 transition hover:border-violet-400/60 ${error ? "border-red-500/50" : "border-violet-500/25"}`}
      >
        <Icon className="text-2xl text-violet-300" aria-hidden="true" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-white">{file ? file.name : "Choose a file"}</span>
          <span className="block text-xs text-gray-500">{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : hint}</span>
        </span>
      </label>
      <input id={id} type="file" accept={accept} className="sr-only" onChange={(e) => onChange(e.target.files?.[0] || null)} />
      {error && <p role="alert" className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export const CreateMusic = () => {
  usePageTitle("Upload Music");
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("other");
  const [isExplicit, setIsExplicit] = useState(false);
  const [musicFile, setMusicFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const pickAudio = (file) => {
    const check = file ? validateFile(file, "audio") : { valid: true };
    setErrors((e) => ({ ...e, music: check.valid ? undefined : check.message }));
    setMusicFile(check.valid ? file : null);
    if (file && check.valid && !title) setTitle(file.name.replace(/\.[^.]+$/, "").slice(0, 120));
  };

  const pickCover = (file) => {
    const check = file ? validateFile(file, "image") : { valid: true };
    setErrors((e) => ({ ...e, cover: check.valid ? undefined : check.message }));
    setCoverImage(check.valid ? file : null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(check.valid && file ? URL.createObjectURL(file) : null);
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!title.trim()) nextErrors.title = "Title is required";
    if (!musicFile) nextErrors.music = "Please choose an audio file";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const form = new FormData();
    form.append("title", title.trim());
    form.append("genre", genre);
    form.append("isExplicit", String(isExplicit));
    form.append("music", musicFile);
    if (coverImage) form.append("coverImage", coverImage);

    setUploading(true);
    setProgress(0);
    try {
      await api.post("/music/upload", form, {
        onUploadProgress: (e) => e.total && setProgress(Math.round((e.loaded / e.total) * 100)),
      });
      showToast("Song uploaded! Your followers have been notified.", "success");
      navigate("/artist/my-music");
    } catch (err) {
      if (err.response?.data?.code !== "PLAN_LIMIT") showToast(getErrorMessage(err, "Upload failed"), "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="animate-fade-in-up mx-auto max-w-2xl">
      <PageHeader title="Upload Music" subtitle={`MP3, WAV or M4A up to ${FILE_TYPE_CONFIG.audio.maxSizeBytes / 1024 / 1024} MB`} icon={FaCloudUploadAlt} />
      <Card>
        <form onSubmit={submit} className="space-y-5" noValidate>
          <FilePicker id="music-file" label="Audio file *" icon={FaFileAudio} accept={FILE_TYPE_CONFIG.audio.accept} file={musicFile} onChange={pickAudio} hint={FILE_TYPE_CONFIG.audio.formatsLabel} error={errors.music} />
          <Input label="Title" value={title} maxLength={120} showCounter onChange={(e) => setTitle(e.target.value)} error={errors.title} required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} options={GENRES.map((g) => ({ value: g, label: genreLabel(g) }))} />
            <label className="flex min-h-10 cursor-pointer items-center gap-2 self-end text-sm text-gray-300">
              <input type="checkbox" checked={isExplicit} onChange={(e) => setIsExplicit(e.target.checked)} className="h-4 w-4 accent-violet-500" /> Explicit content
            </label>
          </div>
          <div className="grid items-start gap-4 sm:grid-cols-[1fr_auto]">
            <FilePicker id="cover-file" label="Cover image (optional)" icon={FaImage} accept={FILE_TYPE_CONFIG.image.accept} file={coverImage} onChange={pickCover} hint="JPG, PNG, WEBP up to 5 MB" error={errors.cover} />
            {preview && <img src={preview} alt="Cover preview" className="h-24 w-24 rounded-xl object-cover sm:mt-7" />}
          </div>
          {uploading && (
            <div aria-live="polite">
              <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                <div className="h-full bg-linear-to-r from-violet-500 to-fuchsia-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1 text-xs text-gray-400">{progress < 100 ? `Uploading... ${progress}%` : "Processing on the server..."}</p>
            </div>
          )}
          <Button type="submit" size="lg" className="w-full" loading={uploading} icon={FaCloudUploadAlt}>
            Upload song
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CreateMusic;
