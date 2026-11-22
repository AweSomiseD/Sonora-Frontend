import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaCompactDisc, FaFlag, FaPlay, FaTrash } from "react-icons/fa";
import { TrackRow } from "../components/MusicCard.jsx";
import ReportModal from "../components/ReportModal.jsx";
import { Badge, Button, ConfirmDialog, EmptyState, ErrorState, Skeleton, SkeletonList } from "../components/ui/index.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { usePlayer } from "../context/PlayerContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import api, { getErrorMessage } from "../services/api.js";
import { artistName, formatDate, formatDuration } from "../utils/format.js";

export const AlbumDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeRole } = useAuth();
  const { playQueue } = usePlayer();
  const { showToast } = useToast();
  const [album, setAlbum] = useState(null);
  const [error, setError] = useState("");
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  usePageTitle(album?.title || "Album");

  const load = () => {
    setError("");
    api
      .get(`/music/albums/${id}`)
      .then(({ data }) => setAlbum(data.album))
      .catch((err) => setError(getErrorMessage(err, "Album not found")));
  };
  useEffect(load, [id]);

  const removeSong = async () => {
    setRemoving(true);
    try {
      const { data } = await api.delete(`/music/album/${id}/music/${removeTarget._id}`);
      setAlbum((prev) => ({ ...prev, musics: data.album.musics, trackCount: data.album.trackCount }));
      showToast("Song removed from album", "success");
      setRemoveTarget(null);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setRemoving(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!album) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <SkeletonList />
      </div>
    );
  }

  const tracks = album.musics || [];
  const totalSeconds = tracks.reduce((sum, t) => sum + (t.duration || 0), 0);
  const canEdit = album.isOwner && activeRole === "artist";

  return (
    <div className="animate-fade-in-up">
      <button type="button" onClick={() => navigate(-1)} className="mb-4 inline-flex min-h-10 cursor-pointer items-center gap-2 text-sm text-gray-400 hover:text-white">
        <FaArrowLeft aria-hidden="true" /> Back
      </button>

      <div className="flex flex-col gap-6 rounded-2xl border border-violet-500/10 bg-linear-to-br from-violet-600/15 to-fuchsia-600/5 p-5 sm:flex-row sm:items-end sm:p-8">
        {album.coverImage ? (
          <img src={album.coverImage} alt="" className="h-44 w-44 shrink-0 rounded-2xl object-cover shadow-2xl" />
        ) : (
          <div className="flex h-44 w-44 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-violet-600 to-fuchsia-600 text-5xl">
            <FaCompactDisc aria-hidden="true" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">Album {album.status === "hidden" && <Badge tone="red">Hidden</Badge>}</p>
          <h1 className="mt-1 text-3xl font-black text-white sm:text-5xl">{album.title}</h1>
          <p className="mt-2 text-sm text-gray-300">
            {album.artist?._id && activeRole === "listener" ? (
              <Link to={`/listener/artists/${album.artist._id}`} className="font-semibold text-white hover:underline">
                {artistName(album.artist)}
              </Link>
            ) : (
              <span className="font-semibold text-white">{artistName(album.artist)}</span>
            )}{" "}
            · {tracks.length} songs · {formatDuration(totalSeconds)} · {formatDate(album.createdAt)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button icon={FaPlay} disabled={!tracks.length} onClick={() => playQueue(tracks, 0)}>
              Play
            </Button>
            {!album.isOwner && (
              <Button variant="ghost" icon={FaFlag} onClick={() => setReportOpen(true)}>
                Report
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        {tracks.length === 0 ? (
          <EmptyState icon={FaCompactDisc} title="This album has no songs yet" />
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
                  canEdit && (
                    <button type="button" onClick={() => setRemoveTarget(music)} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-gray-500 hover:text-red-300" aria-label={`Remove ${music.title} from album`}>
                      <FaTrash aria-hidden="true" />
                    </button>
                  )
                }
              />
            ))}
          </ol>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(removeTarget)}
        title="Remove song from album?"
        message={`"${removeTarget?.title}" stays in your music; it is only removed from this album.`}
        confirmLabel="Remove"
        loading={removing}
        onConfirm={removeSong}
        onCancel={() => setRemoveTarget(null)}
      />
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} targetType="album" targetId={album._id} targetLabel={album.title} />
    </div>
  );
};

export default AlbumDetails;
