import { useEffect, useState } from "react";
import socket from "../socket.js";

// Live "listening now" count. Only shown while the socket is connected (logged in).
export const OnlineCount = ({ className = "" }) => {
  const [count, setCount] = useState(null);

  useEffect(() => {
    const onCount = (value) => setCount(value);
    const requestCount = () => socket.emit("get_online_count");
    const onDisconnect = () => setCount(null);

    socket.on("online_count", onCount);
    socket.on("connect", requestCount);
    socket.on("disconnect", onDisconnect);
    if (socket.connected) requestCount();

    return () => {
      socket.off("online_count", onCount);
      socket.off("connect", requestCount);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  if (count === null) return null;

  return (
    <div className={`flex items-center gap-2 text-xs text-gray-300 ${className}`} aria-live="polite">
      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" aria-hidden="true" />
      {count} listening now
    </div>
  );
};

export default OnlineCount;
