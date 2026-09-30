import { useEffect, useRef, useState } from "react";
import {
  FaPause,
  FaPlay,
  FaTimes,
  FaVolumeUp,
  FaStepBackward,
  FaStepForward,
} from "react-icons/fa";
import api from "../services/api.js";

export const MusicPlayer = ({
  music,
  onClose,
  queue = [],
  onNext,
  onPrevious,
}) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (!music || !audioRef.current) return;
    const audio = audioRef.current;
    audio.src = music.uri;
    audio.load();
    setProgress(0);
    setDuration(0);
    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        api.post(`/music/${music._id}/play`).catch(() => {});
      })
      .catch(() => setIsPlaying(false));
  }, [music]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused)
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    else {
      audio.pause();
      setIsPlaying(false);
    }
  };
  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return "0:00";
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  };
  const seek = (event) => {
    const next = Number(event.target.value);
    audioRef.current.currentTime = next;
    setProgress(next);
  };
  const next = () => onNext?.();
  const previous = () => onPrevious?.();

  if (!music) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 bg-gray-950/95 px-3 py-3 text-white shadow-2xl backdrop-blur sm:px-6">
      <audio
        ref={audioRef}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onEnded={() => {
          setIsPlaying(false);
          next();
        }}
      />
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 sm:gap-5">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:min-w-56">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500">
            <FaPlay />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-bold">{music.title}</h3>
            <p className="truncate text-sm text-gray-400">
              {music.artist?.username || "Unknown Artist"}
            </p>
          </div>
        </div>
        <div className="order-3 flex w-full items-center gap-2 sm:order-0 sm:w-auto sm:flex-1">
          <span className="w-9 text-right text-xs text-gray-400">
            {formatTime(progress)}
          </span>
          <input
            aria-label="Seek"
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={Math.min(progress, duration || 0)}
            onChange={seek}
            className="h-1.5 min-w-0 flex-1 accent-amber-500"
          />
          <span className="w-9 text-xs text-gray-400">
            {formatTime(duration)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={previous}
            disabled={!onPrevious && !queue.length}
            aria-label="Previous"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-40 sm:flex"
          >
            <FaStepBackward />
          </button>
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 text-gray-950 hover:bg-amber-400"
          >
            {isPlaying ? <FaPause /> : <FaPlay className="ml-0.5" />}
          </button>
          <button
            onClick={next}
            disabled={!onNext && !queue.length}
            aria-label="Next"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-40 sm:flex"
          >
            <FaStepForward />
          </button>
        </div>
        <label className="hidden items-center gap-2 text-gray-400 md:flex">
          <FaVolumeUp />
          <input
            aria-label="Volume"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => {
              const v = Number(e.target.value);
              setVolume(v);
              audioRef.current.volume = v;
            }}
            className="w-20 accent-amber-500"
          />
        </label>
        <button
          onClick={onClose}
          aria-label="Close player"
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-gray-800 hover:text-white"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};
