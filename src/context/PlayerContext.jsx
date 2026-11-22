import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import api from "../services/api.js";
import { artistName } from "../utils/format.js";
import { useToast } from "./ToastContext.jsx";

// One global audio player. It lives above the routes, so music keeps
// playing while you navigate and while you switch dashboards.
const PlayerContext = createContext(null);

const VOLUME_KEY = "sonora:volume";
const readVolume = () => {
  try {
    const v = Number(localStorage.getItem(VOLUME_KEY));
    return Number.isFinite(v) && v >= 0 && v <= 1 && localStorage.getItem(VOLUME_KEY) !== null ? v : 0.8;
  } catch {
    return 0.8;
  }
};

const shuffled = (length, firstIndex) => {
  const rest = Array.from({ length }, (_, i) => i).filter((i) => i !== firstIndex);
  for (let i = rest.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [firstIndex, ...rest];
};

export const PlayerProvider = ({ children }) => {
  const { showToast } = useToast();
  const audioRef = useRef(null);
  if (!audioRef.current && typeof Audio !== "undefined") {
    audioRef.current = new Audio();
    audioRef.current.preload = "metadata";
  }

  const [queue, setQueue] = useState([]);
  const [order, setOrder] = useState([]); // play order (indexes into queue)
  const [position, setPosition] = useState(-1); // index into order
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(readVolume);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState("off"); // off | all | one
  const [queueOpen, setQueueOpen] = useState(false);

  // play-count bookkeeping for the current track
  const listenedRef = useRef(0);
  const lastTickRef = useRef(0);
  const countedRef = useRef(false);

  const currentIndex = position >= 0 ? order[position] : -1;
  const currentTrack = currentIndex >= 0 ? queue[currentIndex] : null;

  // ===== Load a track when the current one changes =====
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    listenedRef.current = 0;
    lastTickRef.current = 0;
    countedRef.current = false;
    audio.src = currentTrack.uri;
    audio.currentTime = 0;
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [currentTrack?._id, currentTrack?.uri]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    audioRef.current.muted = muted;
    try {
      localStorage.setItem(VOLUME_KEY, String(volume));
    } catch {
      // ignore
    }
  }, [volume, muted]);

  // ===== Navigation helpers =====
  const goTo = useCallback((nextPosition) => {
    setPosition(nextPosition);
  }, []);

  const playQueue = useCallback(
    (tracks, startIndex = 0) => {
      const list = (tracks || []).filter((t) => t?.uri);
      if (list.length === 0) return;
      const start = Math.min(Math.max(startIndex, 0), list.length - 1);
      // same queue + same track: just toggle
      if (queue[order[position]]?._id === list[start]._id && queue.length === list.length) {
        const audio = audioRef.current;
        if (audio.paused) audio.play().then(() => setIsPlaying(true)).catch(() => {});
        return;
      }
      setQueue(list);
      const nextOrder = shuffle ? shuffled(list.length, start) : list.map((_, i) => i);
      setOrder(nextOrder);
      setPosition(shuffle ? 0 : start);
    },
    [queue, order, position, shuffle],
  );

  const playTrack = useCallback((track) => playQueue([track], 0), [playQueue]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (audio.paused) audio.play().then(() => setIsPlaying(true)).catch(() => {});
    else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [currentTrack]);

  const advance = useCallback(
    (direction, { auto = false } = {}) => {
      if (order.length === 0) return;
      let next = position + direction;
      if (next >= order.length) {
        if (repeat === "all" || !auto) next = 0;
        else {
          setIsPlaying(false);
          return;
        }
      }
      if (next < 0) next = repeat === "all" ? order.length - 1 : 0;
      goTo(next);
      if (next === position) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    },
    [order.length, position, repeat, goTo],
  );

  // Manual skip before the play counted: ask the server (free plan has a limit)
  const next = useCallback(async () => {
    if (!currentTrack) return;
    if (!countedRef.current) {
      try {
        await api.post("/music/skip");
      } catch (error) {
        if (error.response?.data?.code === "PLAN_LIMIT") return; // upgrade modal is shown globally
      }
    }
    advance(1);
  }, [currentTrack, advance]);

  const previous = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    advance(-1);
  }, [advance]);

  const seek = useCallback((seconds) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(seconds, audioRef.current.duration || seconds));
    lastTickRef.current = audioRef.current.currentTime;
  }, []);

  const setVolume = useCallback((value) => {
    setVolumeState(Math.max(0, Math.min(1, value)));
    setMuted(false);
  }, []);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);

  const toggleShuffle = useCallback(() => {
    setShuffle((on) => {
      const nextOn = !on;
      if (queue.length > 0 && currentIndex >= 0) {
        if (nextOn) {
          setOrder(shuffled(queue.length, currentIndex));
          setPosition(0);
        } else {
          setOrder(queue.map((_, i) => i));
          setPosition(currentIndex);
        }
      }
      return nextOn;
    });
  }, [queue, currentIndex]);

  const cycleRepeat = useCallback(() => setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off")), []);

  const addToQueue = useCallback(
    (track) => {
      if (!track?.uri) return;
      if (queue.length === 0) {
        playQueue([track], 0);
        return;
      }
      setQueue((q) => [...q, track]);
      setOrder((o) => [...o, queue.length]);
      showToast(`Added "${track.title}" to the queue`, "success");
    },
    [queue.length, playQueue, showToast],
  );

  const removeFromQueue = useCallback(
    (orderPosition) => {
      if (orderPosition === position) return; // cannot remove the playing track
      setOrder((o) => o.filter((_, i) => i !== orderPosition));
      if (orderPosition < position) setPosition((p) => p - 1);
    },
    [position],
  );

  const clearQueue = useCallback(() => {
    audioRef.current?.pause();
    setQueue([]);
    setOrder([]);
    setPosition(-1);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  // ===== Audio element events =====
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const onTime = () => {
      const t = audio.currentTime;
      setCurrentTime(t);
      // count only real listening time (seeking does not count)
      const delta = t - lastTickRef.current;
      if (delta > 0 && delta < 2) listenedRef.current += delta;
      lastTickRef.current = t;

      const total = audio.duration || currentTrack?.duration || 0;
      const threshold = Math.min(30, total > 0 ? total * 0.5 : 30);
      if (!countedRef.current && currentTrack && listenedRef.current >= threshold) {
        countedRef.current = true;
        api.post(`/music/${currentTrack._id}/play`).catch(() => {});
      }
    };
    const onLoaded = () => setDuration(audio.duration || currentTrack?.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      if (repeat === "one") {
        audio.currentTime = 0;
        listenedRef.current = 0;
        countedRef.current = false;
        audio.play().catch(() => {});
      } else {
        advance(1, { auto: true });
      }
    };
    const onError = () => {
      if (!currentTrack) return;
      showToast(`Could not play "${currentTrack.title}". Skipping.`, "error");
      if (order.length > 1) advance(1, { auto: true });
      else setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [currentTrack, repeat, advance, order.length, showToast]);

  // ===== Media Session (lock screen / headset controls) =====
  useEffect(() => {
    if (!("mediaSession" in navigator) || !currentTrack) return;
    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: currentTrack.title,
        artist: artistName(currentTrack.artist),
        album: "Sonora",
        artwork: currentTrack.coverImage ? [{ src: currentTrack.coverImage, sizes: "512x512" }] : [],
      });
      navigator.mediaSession.setActionHandler("play", togglePlay);
      navigator.mediaSession.setActionHandler("pause", togglePlay);
      navigator.mediaSession.setActionHandler("nexttrack", next);
      navigator.mediaSession.setActionHandler("previoustrack", previous);
      navigator.mediaSession.setActionHandler("seekto", (details) => seek(details.seekTime || 0));
    } catch {
      // older browsers
    }
  }, [currentTrack, togglePlay, next, previous, seek]);

  // ===== Keyboard shortcuts: space, left/right arrows, m =====
  useEffect(() => {
    const onKey = (event) => {
      const tag = event.target?.tagName;
      if (["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(tag) || event.target?.isContentEditable) return;
      if (event.ctrlKey || event.metaKey || event.altKey || !currentTrack) return;
      if (event.code === "Space") {
        event.preventDefault();
        togglePlay();
      } else if (event.key === "ArrowRight") {
        seek((audioRef.current?.currentTime || 0) + 10);
      } else if (event.key === "ArrowLeft") {
        seek((audioRef.current?.currentTime || 0) - 10);
      } else if (event.key.toLowerCase() === "m") {
        toggleMute();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentTrack, togglePlay, seek, toggleMute]);

  const upcoming = useMemo(() => order.map((index, orderPosition) => ({ track: queue[index], orderPosition })), [order, queue]);

  const value = {
    currentTrack,
    queue: upcoming,
    position,
    isPlaying,
    currentTime,
    duration: duration || currentTrack?.duration || 0,
    volume,
    muted,
    shuffle,
    repeat,
    queueOpen,
    setQueueOpen,
    playQueue,
    playTrack,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    addToQueue,
    removeFromQueue,
    clearQueue,
    jumpTo: goTo,
    isCurrent: (track) => Boolean(track && currentTrack && track._id === currentTrack._id),
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used inside PlayerProvider");
  return context;
};
