import { useEffect, useState } from "react";
import socket from "../socket.js";

export const OnlineCount = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const handleCountUpdate = (newCount) => {
      setCount(newCount);
    };

    const requestCount = () => {
      socket.emit("get_online_count");
    };

    socket.on("online_count", handleCountUpdate);
    socket.on("connect", requestCount);

    if (socket.connected) {
      requestCount();
    } else {
      socket.connect();
    }

    return () => {
      socket.off("online_count", handleCountUpdate);
      socket.off("connect", requestCount);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
      {count} listening now
    </div>
  );
};
