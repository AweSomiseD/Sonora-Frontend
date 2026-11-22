import {
  FaListUl,
  FaMusic,
  FaPause,
  FaPlay,
  FaRandom,
  FaRedo,
  FaStepBackward,
  FaStepForward,
  FaTimes,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import { usePlayer } from "../context/PlayerContext.jsx";
import { artistName, formatDuration } from "../utils/format.js";
import { LikeButton } from "./LikeButton.jsx";

const iconButton =
  "flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40";

function QueuePanel() {
  const { queue, position, jumpTo, removeFromQueue, setQueueOpen, clearQueue } = usePlayer();
  return (
    <aside className="animate-panel-in fixed bottom-24 right-2 top-20 z-40 flex w-[min(24rem,calc(100vw-1rem))] flex-col rounded-2xl border border-violet-500/20 bg-gray-900/95 shadow-2xl backdrop-blur-xl sm:right-4" aria-label="Queue">
      <div className="flex items-center justify-between border-b border-violet-500/10 px-4 py-3">
        <h2 className="font-bold text-white">Now playing &amp; up next</h2>
        <div className="flex items-center gap-1">
          <button type="button" onClick={clearQueue} className="cursor-pointer rounded-lg px-2 py-1 text-xs text-gray-400 hover:text-red-300">
            Clear
          </button>
          <button type="button" onClick={() => setQueueOpen(false)} className={iconButton} aria-label="Close queue">
            <FaTimes aria-hidden="true" />
          </button>
        </div>
      </div>
      <ol className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        {queue.map(({ track, orderPosition }) => {
          const playing = orderPosition === position;
          return (
            <li key={`${track._id}-${orderPosition}`} className={`group flex items-center gap-3 rounded-xl p-2 ${playing ? "bg-violet-500/15" : "hover:bg-white/5"}`}>
              <button type="button" onClick={() => jumpTo(orderPosition)} className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left">
                {track.coverImage ? (
                  <img src={track.coverImage} alt="" className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300">
                    <FaMusic aria-hidden="true" />
                  </span>
                )}
                <span className="min-w-0">
                  <span className={`block truncate text-sm font-semibold ${playing ? "text-fuchsia-300" : "text-white"}`}>{track.title}</span>
                  <span className="block truncate text-xs text-gray-400">{artistName(track.artist)}</span>
                </span>
              </button>
              {!playing && (
                <button type="button" onClick={() => removeFromQueue(orderPosition)} className="h-8 w-8 cursor-pointer rounded-lg text-gray-500 opacity-0 hover:text-red-300 group-hover:opacity-100 focus:opacity-100" aria-label={`Remove ${track.title} from queue`}>
                  <FaTimes className="mx-auto" aria-hidden="true" />
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

export default function PlayerBar() {
  const p = usePlayer();
  const track = p.currentTrack;
  if (!track) return null;

  const progress = p.duration > 0 ? (p.currentTime / p.duration) * 100 : 0;

  return (
    <>
      {p.queueOpen && <QueuePanel />}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-violet-500/20 bg-gray-950/95 px-3 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur-xl sm:px-5" role="region" aria-label="Music player">
        {/* thin progress line on mobile */}
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gray-800 sm:hidden" aria-hidden="true">
          <div className="h-full bg-linear-to-r from-violet-500 to-fuchsia-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="mx-auto flex max-w-7xl items-center gap-3">
          {/* Track info */}
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:w-1/4 sm:flex-none">
            {track.coverImage ? (
              <img src={track.coverImage} alt="" className={`h-12 w-12 shrink-0 rounded-lg object-cover ${p.isPlaying ? "shadow-[0_0_20px_rgba(139,92,246,0.5)]" : ""}`} />
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-violet-600 to-fuchsia-600 text-white">
                <FaMusic aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{track.title}</p>
              <p className="truncate text-xs text-gray-400">{artistName(track.artist)}</p>
            </div>
            <span className="hidden md:inline-flex">
              <LikeButton musicId={track._id} />
            </span>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center sm:flex-1">
            <div className="flex items-center gap-1 sm:gap-2">
              <button type="button" onClick={p.toggleShuffle} className={`${iconButton} hidden sm:flex ${p.shuffle ? "text-fuchsia-400" : ""}`} aria-label={p.shuffle ? "Shuffle on" : "Shuffle off"} aria-pressed={p.shuffle}>
                <FaRandom aria-hidden="true" />
              </button>
              <button type="button" onClick={p.previous} className={iconButton} aria-label="Previous track">
                <FaStepBackward aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={p.togglePlay}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white text-gray-950 shadow-[0_0_20px_rgba(255,255,255,0.25)] transition hover:scale-105"
                aria-label={p.isPlaying ? "Pause" : "Play"}
              >
                {p.isPlaying ? <FaPause aria-hidden="true" /> : <FaPlay className="ml-0.5" aria-hidden="true" />}
              </button>
              <button type="button" onClick={p.next} className={iconButton} aria-label="Next track">
                <FaStepForward aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={p.cycleRepeat}
                className={`${iconButton} relative hidden sm:flex ${p.repeat !== "off" ? "text-fuchsia-400" : ""}`}
                aria-label={`Repeat: ${p.repeat}`}
              >
                <FaRedo aria-hidden="true" />
                {p.repeat === "one" && <span className="absolute bottom-1 right-1.5 text-[9px] font-bold">1</span>}
              </button>
            </div>

            <div className="hidden w-full max-w-xl items-center gap-2 sm:flex">
              <span className="w-10 text-right text-[11px] tabular-nums text-gray-400">{formatDuration(p.currentTime)}</span>
              <input
                type="range"
                min="0"
                max={p.duration || 0}
                step="0.5"
                value={Math.min(p.currentTime, p.duration || 0)}
                onChange={(e) => p.seek(Number(e.target.value))}
                className="range-violet h-1 flex-1"
                aria-label="Seek"
              />
              <span className="w-10 text-[11px] tabular-nums text-gray-400">{formatDuration(p.duration)}</span>
            </div>
          </div>

          {/* Volume + queue */}
          <div className="hidden items-center justify-end gap-2 sm:flex sm:w-1/4">
            <button type="button" onClick={p.toggleMute} className={iconButton} aria-label={p.muted ? "Unmute" : "Mute"}>
              {p.muted || p.volume === 0 ? <FaVolumeMute aria-hidden="true" /> : <FaVolumeUp aria-hidden="true" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={p.muted ? 0 : p.volume}
              onChange={(e) => p.setVolume(Number(e.target.value))}
              className="range-violet hidden h-1 w-24 lg:block"
              aria-label="Volume"
            />
            <button type="button" onClick={() => p.setQueueOpen(!p.queueOpen)} className={`${iconButton} ${p.queueOpen ? "text-fuchsia-400" : ""}`} aria-label="Show queue" aria-pressed={p.queueOpen}>
              <FaListUl aria-hidden="true" />
            </button>
          </div>
          <button type="button" onClick={() => p.setQueueOpen(!p.queueOpen)} className={`${iconButton} sm:hidden`} aria-label="Show queue">
            <FaListUl aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  );
}
