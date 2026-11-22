import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaChartLine, FaCloudUploadAlt, FaEdit, FaEyeSlash, FaMusic, FaPlay, FaTrash } from "react-icons/fa";
import { TrackRow } from "../components/MusicCard.jsx";
import { Badge, Button, ConfirmDialog, EmptyState, ErrorState, Input, Modal, PageHeader, Select, SkeletonList } from "../components/ui/index.jsx";
import { GENRES, PLAN_LIMITS, genreLabel } from "../constants/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import { usePlayer } from "../context/PlayerContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import api, { getErrorMessage } from "../services/api.js";
import { formatCount } from "../utils/format.js";
import { FILE_TYPE_CONFIG, validateFile } from "../utils/fileValidation.js";

function EditMusicModal({ music, onClose, onSaved }) {
  const { showToast } = useToast();
  const [title, setTitle] = useState(music.title);
  const [genre, setGenre] = useState(music.genre || "other");
  const [isExplicit, setIsExplicit] = useState(Boolean(music.isExplicit));
  const [cover, setCover] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) return setError("Title is required");
    if (cover) {
      const check = validateFile(cover, "image");
      if (!check.valid) return setError(check.message);
    }
    setSaving(true);
    setError("");
    try {
      const form = new FormData();
      form.append("title", title.trim());
      form.append("genre", genre);
      form.append("isExplicit", String(isExplicit));
      if (cover) form.append("coverImage", cover);
      const { data } = await api.patch(`/music/${music._id}`, form);
      onSaved(data.music);
      showToast("Song updated", "success");
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Could not save"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit song"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} loading={saving}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Title" value={title} maxLength={120} showCounter onChange={(e) => setTitle(e.target.value)} required />
        <Select label="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} options={GENRES.map((g) => ({ value: g, label: genreLabel(g) }))} />
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" checked={isExplicit} onChange={(e) => setIsExplicit(e.target.checked)} className="h-4 w-4 accent-violet-500" /> Explicit content
        </label>
        <div>
          <label htmlFor="edit-cover" className="text-sm font-medium text-gray-300">
            New cover (optional)
          </label>
          <input id="edit-cover" type="file" accept={FILE_TYPE_CONFIG.image.accept} onChange={(e) => setCover(e.target.files?.[0] || null)} className="mt-1 block w-full text-sm text-gray-400 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-violet-500/20 file:px-3 file:py-2 file:text-violet-100" />
        </div>
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      </div>
    </Modal>
  );
}

export const MyMusic = () => {
  usePageTitle("My Music");
  const { user } = useAuth();
  const { playQueue } = usePlayer();
  const { showToast } = useToast();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setError("");
    api
      .get("/music/my-music")
      .then(({ data }) => setItems(data.items))
      .catch((err) => setError(getErrorMessage(err)));
  };
  useEffect(load, []);

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/music/${deleting._id}`);
      setItems((prev) => prev.filter((m) => m._id !== deleting._id));
      showToast("Song deleted", "success");
      setDeleting(null);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  const isPremium = user?.subscriptionStatus === "premium";
  const published = items?.filter((m) => m.status !== "hidden") || [];
  const limit = PLAN_LIMITS.artist.free.maxPublishedTracks;

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="My Music"
        subtitle={items ? `${items.length} song${items.length === 1 ? "" : "s"}${isPremium ? "" : ` · ${published.length}/${limit} on the free plan`}` : "Loading..."}
        icon={FaMusic}
        actions={
          <>
            {published.length > 0 && <Button variant="secondary" icon={FaPlay} onClick={() => playQueue(published, 0)}>Play all</Button>}
            <Link to="/artist/upload-music" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-600 px-4 text-sm font-semibold text-white">
              <FaCloudUploadAlt aria-hidden="true" /> Upload
            </Link>
          </>
        }
      />
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !items ? (
        <SkeletonList count={6} />
      ) : items.length === 0 ? (
        <EmptyState icon={FaMusic} title="No songs yet" message="Upload your first song and share it with listeners." action={<Link to="/artist/upload-music" className="font-semibold text-violet-300 hover:underline">Upload music</Link>} />
      ) : (
        <ol className="space-y-1">
          {items.map((music) => (
            <TrackRow
              key={music._id}
              music={music}
              list={published}
              index={Math.max(0, published.findIndex((m) => m._id === music._id))}
              extra={
                <>
                  {formatCount(music.playCount)} plays · {genreLabel(music.genre)}
                  {music.status === "hidden" && (
                    <Badge tone="red" className="ml-2">
                      <FaEyeSlash aria-hidden="true" /> Hidden{music.hiddenReason === "moderation" ? " by moderator" : ""}
                    </Badge>
                  )}
                </>
              }
              actions={
                <>
                  <Link to="/artist/analytics" className="hidden h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:text-violet-200 sm:flex" aria-label={`Analytics for ${music.title}`}>
                    <FaChartLine aria-hidden="true" />
                  </Link>
                  <button type="button" onClick={() => setEditing(music)} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-gray-500 hover:text-violet-200" aria-label={`Edit ${music.title}`}>
                    <FaEdit aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => setDeleting(music)} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-gray-500 hover:text-red-300" aria-label={`Delete ${music.title}`}>
                    <FaTrash aria-hidden="true" />
                  </button>
                </>
              }
            />
          ))}
        </ol>
      )}
      {editing && <EditMusicModal music={editing} onClose={() => setEditing(null)} onSaved={(updated) => setItems((prev) => prev.map((m) => (m._id === updated._id ? updated : m)))} />}
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this song?"
        message={`"${deleting?.title}" will be removed from albums, playlists and likes. This cannot be undone.`}
        confirmLabel="Delete"
        loading={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
};

export default MyMusic;
