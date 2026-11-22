import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaCompactDisc, FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { Badge, Button, ConfirmDialog, EmptyState, ErrorState, Input, Modal, PageHeader, SkeletonGrid } from "../components/ui/index.jsx";
import { useToast } from "../context/ToastContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import api, { getErrorMessage } from "../services/api.js";
import { formatDate } from "../utils/format.js";

export const MyAlbums = () => {
  usePageTitle("My Albums");
  const { showToast } = useToast();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setError("");
    api
      .get("/music/my-albums")
      .then(({ data }) => setItems(data.items))
      .catch((err) => setError(getErrorMessage(err)));
  };
  useEffect(load, []);

  const saveTitle = async () => {
    if (!title.trim()) return;
    setBusy(true);
    try {
      await api.patch(`/music/album/${editing._id}`, { title: title.trim() });
      setItems((prev) => prev.map((a) => (a._id === editing._id ? { ...a, title: title.trim() } : a)));
      showToast("Album renamed", "success");
      setEditing(null);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/music/album/${deleting._id}`);
      setItems((prev) => prev.filter((a) => a._id !== deleting._id));
      showToast("Album deleted (songs are kept)", "success");
      setDeleting(null);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="My Albums"
        subtitle={items ? `${items.length} album${items.length === 1 ? "" : "s"}` : "Loading..."}
        icon={FaCompactDisc}
        actions={
          <Link to="/artist/create-album" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-600 px-4 text-sm font-semibold text-white">
            <FaPlus aria-hidden="true" /> New album
          </Link>
        }
      />
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !items ? (
        <SkeletonGrid count={6} />
      ) : items.length === 0 ? (
        <EmptyState icon={FaCompactDisc} title="No albums yet" message="Group your songs into an album." action={<Link to="/artist/create-album" className="font-semibold text-violet-300 hover:underline">Create an album</Link>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((album) => (
            <div key={album._id} className="flex gap-4 rounded-2xl border border-violet-500/10 bg-gray-900/50 p-4">
              <Link to={`/artist/album/${album._id}`} className="shrink-0">
                {album.coverImage ? (
                  <img src={album.coverImage} alt="" className="h-24 w-24 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-linear-to-br from-violet-600/40 to-fuchsia-600/30 text-2xl text-violet-200">
                    <FaCompactDisc aria-hidden="true" />
                  </div>
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={`/artist/album/${album._id}`} className="block truncate font-semibold text-white hover:underline">
                  {album.title}
                </Link>
                <p className="text-xs text-gray-400">
                  {album.musics?.length || 0} songs · {formatDate(album.createdAt)}
                </p>
                {album.status === "hidden" && <Badge tone="red" className="mt-1">Hidden</Badge>}
                <div className="mt-3 flex gap-1">
                  <button type="button" onClick={() => { setEditing(album); setTitle(album.title); }} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-gray-400 hover:text-violet-200" aria-label={`Rename ${album.title}`}>
                    <FaEdit aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => setDeleting(album)} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-gray-400 hover:text-red-300" aria-label={`Delete ${album.title}`}>
                    <FaTrash aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Rename album"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveTitle} loading={busy} disabled={!title.trim()}>Save</Button>
          </>
        }
      >
        <Input label="Album title" value={title} maxLength={100} showCounter onChange={(e) => setTitle(e.target.value)} />
      </Modal>
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this album?"
        message={`"${deleting?.title}" will be deleted. The songs stay in My Music.`}
        confirmLabel="Delete album"
        loading={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
};

export default MyAlbums;
