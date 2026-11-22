import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEllipsisH, FaFlag, FaListUl, FaMusic, FaPause, FaPlay, FaPlus } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import { usePlayer } from "../context/PlayerContext.jsx";
import { getDashboardChildPath } from "../routes/routePaths.js";
import { artistName, formatDuration } from "../utils/format.js";
import AddToPlaylistPopover from "./AddToPlaylistPopover.jsx";
import { LikeButton } from "./LikeButton.jsx";
import ReportModal from "./ReportModal.jsx";
import { Badge } from "./ui/index.jsx";

// Shared "more" menu: add to queue, add to playlist, report
function TrackMenu({ music }) {
  const { addToQueue } = usePlayer();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const isOwn = String(music.artist?._id || music.artist) === String(user?._id);

  const item = "flex min-h-10 w-full cursor-pointer items-center gap-3 px-3 text-left text-sm text-gray-200 hover:bg-violet-500/10";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        onBlur={(e) => !e.currentTarget.parentElement.contains(e.relatedTarget) && setOpen(false)}
        aria-label={`More options for ${music.title}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-gray-400 hover:bg-white/5 hover:text-white"
      >
        <FaEllipsisH aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="animate-fadeIn absolute right-0 z-30 mt-1 w-48 overflow-hidden rounded-xl border border-violet-500/20 bg-gray-900 py-1 shadow-2xl">
          <button role="menuitem" type="button" className={item} onMouseDown={(e) => e.preventDefault()} onClick={() => { addToQueue(music); setOpen(false); }}>
            <FaListUl aria-hidden="true" /> Add to queue
          </button>
          <button role="menuitem" type="button" className={item} onMouseDown={(e) => e.preventDefault()} onClick={() => { setPlaylistOpen(true); setOpen(false); }}>
            <FaPlus aria-hidden="true" /> Add to playlist
          </button>
          {!isOwn && (
            <button role="menuitem" type="button" className={`${item} text-red-300`} onMouseDown={(e) => e.preventDefault()} onClick={() => { setReportOpen(true); setOpen(false); }}>
              <FaFlag aria-hidden="true" /> Report
            </button>
          )}
        </div>
      )}
      <AddToPlaylistPopover music={music} open={playlistOpen} onClose={() => setPlaylistOpen(false)} />
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} targetType="music" targetId={music._id} targetLabel={music.title} />
    </div>
  );
}

const Cover = ({ music, className = "" }) =>
  music.coverImage ? (
    <img src={music.coverImage} alt="" loading="lazy" className={`object-cover ${className}`} />
  ) : (
    <span className={`flex items-center justify-center bg-linear-to-br from-violet-600/40 to-fuchsia-600/30 text-violet-200 ${className}`}>
      <FaMusic aria-hidden="true" />
    </span>
  );

// Grid card. `list` + `index` = the queue that starts when you press play.
export function MusicCard({ music, list, index = 0 }) {
  const { playQueue, isCurrent, isPlaying, togglePlay } = usePlayer();
  const { activeRole } = useAuth();
  const current = isCurrent(music);

  const onPlay = () => (current ? togglePlay() : playQueue(list || [music], list ? index : 0));
  const artistLink = music.artist?._id && activeRole === "listener" ? getDashboardChildPath("listener", `artists/${music.artist._id}`) : null;

  return (
    <article className="group relative rounded-2xl border border-violet-500/10 bg-gray-900/50 p-3 transition hover:border-violet-500/30 hover:bg-gray-900/80">
      <div className="relative aspect-square overflow-hidden rounded-xl">
        <Cover music={music} className="h-full w-full text-3xl transition duration-300 group-hover:scale-105" />
        <button
          type="button"
          onClick={onPlay}
          aria-label={current && isPlaying ? `Pause ${music.title}` : `Play ${music.title}`}
          className={`absolute bottom-2 right-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg transition focus:opacity-100 ${current ? "opacity-100" : "opacity-100 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"}`}
        >
          {current && isPlaying ? <FaPause aria-hidden="true" /> : <FaPlay className="ml-0.5" aria-hidden="true" />}
        </button>
      </div>
      <div className="mt-3 flex items-start gap-1">
        <div className="min-w-0 flex-1">
          <h3 className={`truncate text-sm font-semibold ${current ? "text-fuchsia-300" : "text-white"}`} title={music.title}>
            {music.title}
          </h3>
          {artistLink ? (
            <Link to={artistLink} className="block truncate text-xs text-gray-400 hover:text-violet-200">
              {artistName(music.artist)}
            </Link>
          ) : (
            <p className="truncate text-xs text-gray-400">{artistName(music.artist)}</p>
          )}
          {music.isExplicit && <Badge tone="gray" className="mt-1">E</Badge>}
        </div>
        <LikeButton musicId={music._id} size="sm" />
        <TrackMenu music={music} />
      </div>
    </article>
  );
}

// Row layout for lists (liked, album, playlist, recently played)
export function TrackRow({ music, list, index, number, extra, actions }) {
  const { playQueue, isCurrent, isPlaying, togglePlay } = usePlayer();
  const current = isCurrent(music);
  const onPlay = () => (current ? togglePlay() : playQueue(list || [music], list ? index : 0));

  return (
    <li className={`group flex items-center gap-3 rounded-xl px-2 py-2 transition sm:px-3 ${current ? "bg-violet-500/10" : "hover:bg-white/5"}`}>
      <button type="button" onClick={onPlay} aria-label={current && isPlaying ? `Pause ${music.title}` : `Play ${music.title}`} className="relative h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-lg">
        <Cover music={music} className="h-full w-full" />
        <span className={`absolute inset-0 flex items-center justify-center bg-black/50 text-white transition ${current ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"}`}>
          {current && isPlaying ? <FaPause aria-hidden="true" /> : <FaPlay aria-hidden="true" />}
        </span>
      </button>
      {number !== undefined && <span className="hidden w-6 text-center text-xs text-gray-500 sm:block">{number}</span>}
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-semibold ${current ? "text-fuchsia-300" : "text-white"}`}>
          {music.title} {music.isExplicit && <Badge tone="gray">E</Badge>}
        </p>
        <p className="truncate text-xs text-gray-400">
          {artistName(music.artist)}
          {extra ? <span className="text-gray-500"> · {extra}</span> : null}
        </p>
      </div>
      <span className="hidden text-xs tabular-nums text-gray-500 sm:block">{formatDuration(music.duration)}</span>
      <LikeButton musicId={music._id} size="sm" />
      {actions}
      <TrackMenu music={music} />
    </li>
  );
}

export default MusicCard;
