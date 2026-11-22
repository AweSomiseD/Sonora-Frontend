import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useToast } from "../context/ToastContext.jsx";
import api, { getErrorMessage } from "../services/api.js";
import { Button, Input, Modal, Spinner } from "./ui/index.jsx";

// "Add to playlist" dialog with an inline "Create new playlist" form
export default function AddToPlaylistPopover({ music, open, onClose }) {
  const { showToast } = useToast();
  const [playlists, setPlaylists] = useState(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    if (!open) return;
    setPlaylists(null);
    api
      .get("/playlists/mine")
      .then(({ data }) => setPlaylists(data.items))
      .catch(() => setPlaylists([]));
  }, [open]);

  const add = async (playlist) => {
    setBusy(playlist._id);
    try {
      await api.post(`/playlists/${playlist._id}/tracks`, { musicId: music._id });
      showToast(`Added to "${playlist.name}"`, "success");
      onClose();
    } catch (error) {
      showToast(getErrorMessage(error, "Could not add to playlist"), "error");
    } finally {
      setBusy(null);
    }
  };

  const createAndAdd = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    setBusy("new");
    try {
      const { data } = await api.post("/playlists", { name: name.trim() });
      await api.post(`/playlists/${data.playlist._id}/tracks`, { musicId: music._id });
      showToast(`Created "${data.playlist.name}" and added the song`, "success");
      setName("");
      onClose();
    } catch (error) {
      if (error.response?.data?.code !== "PLAN_LIMIT") showToast(getErrorMessage(error, "Could not create playlist"), "error");
      else onClose();
    } finally {
      setBusy(null);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Add "${music?.title || "song"}" to a playlist`} size="sm">
      {playlists === null ? (
        <div className="flex justify-center py-6">
          <Spinner className="text-2xl" />
        </div>
      ) : (
        <ul className="max-h-64 space-y-1 overflow-y-auto scrollbar-thin">
          {playlists.length === 0 && <li className="py-3 text-sm text-gray-400">You have no playlists yet.</li>}
          {playlists.map((playlist) => (
            <li key={playlist._id}>
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() => add(playlist)}
                className="flex min-h-11 w-full cursor-pointer items-center justify-between rounded-xl px-3 text-left text-sm text-gray-200 hover:bg-violet-500/10 disabled:opacity-50"
              >
                <span className="truncate">{playlist.name}</span>
                <span className="text-xs text-gray-500">{busy === playlist._id ? <Spinner /> : `${playlist.trackCount} songs`}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={createAndAdd} className="mt-4 flex items-end gap-2 border-t border-violet-500/10 pt-4">
        <div className="flex-1">
          <Input label="New playlist" placeholder="Playlist name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
        </div>
        <Button type="submit" icon={FaPlus} loading={busy === "new"} disabled={!name.trim()}>
          Create
        </Button>
      </form>
    </Modal>
  );
}
