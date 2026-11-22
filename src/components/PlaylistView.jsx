import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowDown,
  FaArrowUp,
  FaCopy,
  FaEdit,
  FaFlag,
  FaGlobe,
  FaListUl,
  FaLock,
  FaPlay,
  FaRandom,
  FaShareAlt,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import { usePlayer } from "../context/PlayerContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import api, { getErrorCode, getErrorMessage } from "../services/api.js";
import { formatDuration, timeAgo } from "../utils/format.js";
import { TrackRow } from "./MusicCard.jsx";
import PlaylistFormModal from "./PlaylistFormModal.jsx";
import ReportModal from "./ReportModal.jsx";
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Skeleton,
  SkeletonList,
} from "./ui/index.jsx";
import PremiumBadge from "./PremiumBadge.jsx";

// Shared by the dashboard page (/listener/playlists/:id) and the share link (/playlists/:id)
export default function PlaylistView({ playlistId }) {
  const { activeRole } = useAuth();
  const { playQueue, shuffle, toggleShuffle } = usePlayer();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [busyTrack, setBusyTrack] = useState("");
  usePageTitle(playlist?.name || "Playlist");

  const load = useCallback(async () => {
    setError("");
    try {
      const { data } = await api.get(`/playlists/${playlistId}`);
      setPlaylist(data.playlist);
    } catch (err) {
      setError(
        getErrorCode(err) === "PLAYLIST_NOT_FOUND"
          ? "This playlist does not exist or is private."
          : getErrorMessage(err),
      );
    }
  }, [playlistId]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!playlist) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <SkeletonList count={6} />
      </div>
    );
  }

  const tracks = playlist.tracks.map((t) => t.music);
  const totalSeconds = tracks.reduce((sum, t) => sum + (t.duration || 0), 0);
  const listPath = activeRole === "listener" ? "/listener/playlists" : "/";
  const shareUrl = `${window.location.origin}/playlists/${playlist._id}`;

  const playAll = (shuffled = false) => {
    if (tracks.length === 0) return;
    if (shuffled !== shuffle) toggleShuffle();
    playQueue(tracks, 0);
  };

  const save = async (values) => {
    const { data } = await api.patch(`/playlists/${playlist._id}`, values);
    setPlaylist((p) => ({ ...p, ...data.playlist, tracks: p.tracks }));
    showToast("Playlist updated", "success");
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await api.delete(`/playlists/${playlist._id}`);
      showToast("Playlist deleted", "success");
      navigate(listPath);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
      setDeleting(false);
    }
  };

  const duplicate = async () => {
    try {
      const { data } = await api.post(`/playlists/${playlist._id}/duplicate`);
      showToast("Saved a copy to your playlists", "success", {
        action: {
          label: "Open",
          onClick: () => navigate(`/listener/playlists/${data.playlist._id}`),
        },
      });
    } catch (err) {
      if (getErrorCode(err) !== "PLAN_LIMIT")
        showToast(getErrorMessage(err), "error");
    }
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("Link copied", "success");
    } catch {
      showToast(shareUrl, "info");
    }
  };

  const removeTrack = async (music) => {
    setBusyTrack(music._id);
    try {
      const { data } = await api.delete(
        `/playlists/${playlist._id}/tracks/${music._id}`,
      );
      setPlaylist(data.playlist);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setBusyTrack("");
    }
  };

  const move = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= tracks.length) return;
    const ids = tracks.map((t) => t._id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    // Optimistic update, then sync with the server's order
    const previous = playlist;
    const nextTracks = [...playlist.tracks];
    [nextTracks[index], nextTracks[target]] = [
      nextTracks[target],
      nextTracks[index],
    ];
    setPlaylist({ ...playlist, tracks: nextTracks });
    try {
      const { data } = await api.put(
        `/playlists/${playlist._id}/tracks/order`,
        { musicIds: ids },
      );
      setPlaylist(data.playlist);
    } catch (err) {
      setPlaylist(previous);
      showToast(getErrorMessage(err), "error");
    }
  };

  return (
    <div className="animate-fade-in-up">
      <header className="mb-6 flex flex-col gap-5 rounded-2xl border border-violet-500/10 bg-linear-to-br from-violet-900/40 via-gray-900/60 to-gray-900/60 p-5 sm:flex-row sm:items-end sm:p-6">
        <div className="flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-violet-600/50 to-fuchsia-600/30 text-5xl text-white shadow-2xl">
          {playlist.coverImage ? (
            <img
              src={playlist.coverImage}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <FaListUl aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-violet-300">
            {playlist.isPublic ? (
              <FaGlobe aria-hidden="true" />
            ) : (
              <FaLock aria-hidden="true" />
            )}{" "}
            {playlist.isPublic ? "Public playlist" : "Private playlist"}
          </p>
          <h1 className="mt-1 wrap-break-word text-3xl font-black text-white sm:text-4xl">
            {playlist.name}
          </h1>
          {playlist.description && (
            <p className="mt-2 text-sm text-gray-300">{playlist.description}</p>
          )}
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-400">
            <Avatar
              src={playlist.owner?.avatar}
              name={playlist.owner?.username}
              size="xs"
            />
            <span className="font-semibold text-gray-200">
              {playlist.owner?.username}
            </span>
            {playlist.owner?.isPremium && <PremiumBadge />}
            {totalSeconds > 0 && <>· {formatDuration(totalSeconds)}</>}· updated{" "}
            {timeAgo(playlist.updatedAt)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              icon={FaPlay}
              onClick={() => playAll(false)}
              disabled={!tracks.length}
            >
              Play
            </Button>
            <Button
              variant="secondary"
              icon={FaRandom}
              onClick={() => playAll(true)}
              disabled={!tracks.length}
            >
              Shuffle
            </Button>
            {playlist.isOwner ? (
              <>
                <Button
                  variant="ghost"
                  icon={FaEdit}
                  onClick={() => setEditing(true)}
                >
                  Edit
                </Button>
                <Button variant="ghost" icon={FaCopy} onClick={duplicate}>
                  Duplicate
                </Button>
                {playlist.isPublic && (
                  <Button variant="ghost" icon={FaShareAlt} onClick={share}>
                    Copy link
                  </Button>
                )}
                <Button
                  variant="ghost"
                  icon={FaTrash}
                  onClick={() => setConfirmDelete(true)}
                  className="text-red-300"
                >
                  Delete
                </Button>
              </>
            ) : (
              <>
                {activeRole === "listener" && (
                  <Button variant="ghost" icon={FaCopy} onClick={duplicate}>
                    Save a copy
                  </Button>
                )}
                <Button variant="ghost" icon={FaShareAlt} onClick={share}>
                  Copy link
                </Button>
                <Button
                  variant="ghost"
                  icon={FaFlag}
                  onClick={() => setReporting(true)}
                >
                  Report
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {!playlist.isPublic && playlist.isOwner && (
        <p className="mb-4 text-xs text-gray-500">
          This playlist is private. Make it public in Edit to share a link.
        </p>
      )}

      {tracks.length === 0 ? (
        <EmptyState
          icon={FaListUl}
          title="No tracks yet"
          message={
            playlist.isOwner
              ? "Use the ⋯ menu on any track and choose “Add to playlist”."
              : "The owner has not added songs yet."
          }
        />
      ) : (
        <ol className="space-y-1">
          {tracks.map((music, index) => (
            <TrackRow
              key={music._id}
              music={music}
              list={tracks}
              index={index}
              number={index + 1}
              actions={
                playlist.isOwner && (
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      className="hidden h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-500 hover:text-white disabled:opacity-30 sm:flex"
                      aria-label={`Move ${music.title} up`}
                    >
                      <FaArrowUp aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === tracks.length - 1}
                      className="hidden h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-500 hover:text-white disabled:opacity-30 sm:flex"
                      aria-label={`Move ${music.title} down`}
                    >
                      <FaArrowDown aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeTrack(music)}
                      disabled={busyTrack === music._id}
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-gray-500 hover:text-red-300"
                      aria-label={`Remove ${music.title} from playlist`}
                    >
                      <FaTimes aria-hidden="true" />
                    </button>
                  </div>
                )
              }
            />
          ))}
        </ol>
      )}
      {playlist.tracks.some((t) => t.music?.isExplicit) && (
        <Badge tone="gray" className="mt-4">
          Contains explicit tracks
        </Badge>
      )}

      <PlaylistFormModal
        open={editing}
        onClose={() => setEditing(false)}
        initial={playlist}
        title="Edit playlist"
        submitLabel="Save"
        onSubmit={save}
      />
      <ConfirmDialog
        open={confirmDelete}
        title={`Delete "${playlist.name}"?`}
        message="This cannot be undone. The songs stay on Sonora."
        confirmLabel="Delete playlist"
        loading={deleting}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
      <ReportModal
        open={reporting}
        onClose={() => setReporting(false)}
        targetType="playlist"
        targetId={playlist._id}
        targetLabel={playlist.name}
      />
    </div>
  );
}
