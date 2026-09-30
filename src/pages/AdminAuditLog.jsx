import { useEffect, useState } from "react";
import { FaHistory, FaUser, FaMusic, FaCompactDisc } from "react-icons/fa";

import api from "../services/api.js";

const ACTION_LABELS = {
  USER_ROLE_CHANGED: "Role Changed",
  USER_BANNED: "User Banned",
  USER_UNBANNED: "User Unbanned",
  USER_DELETED: "User Deleted",
  MUSIC_DELETED: "Music Deleted",
  ALBUM_DELETED: "Album Deleted",
};

const TARGET_ICONS = {
  user: FaUser,
  music: FaMusic,
  album: FaCompactDisc,
};

export const AdminAuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/audit-logs");

        setLogs(response.data.logs || []);
      } catch (error) {
        console.error("Failed to fetch audit logs:", error);
        setError("Unable to load audit logs.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const describeLog = (log) => {
    const details = log.details || {};

    if (log.action === "USER_ROLE_CHANGED") {
      return `${details.username || "A user"}'s role changed from ${details.from} to ${details.to}`;
    }
    if (log.action === "USER_BANNED" || log.action === "USER_UNBANNED") {
      return `${details.username || "A user"}`;
    }
    if (log.action === "USER_DELETED") {
      return `${details.username || "A user"} (${details.email || "no email"})`;
    }
    if (log.action === "MUSIC_DELETED") {
      return `"${details.title || "Untitled"}"`;
    }
    if (log.action === "ALBUM_DELETED") {
      return `"${details.title || "Untitled"}"`;
    }
    return "";
  };

  return (
    <div className="px-8 py-10">
      <p className="text-sm font-medium text-amber-500">Accountability</p>
      <h1 className="mt-1 text-3xl font-bold">Audit Log</h1>

      {loading ? (
        <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center">
          <p className="text-gray-400">Loading audit logs...</p>
        </div>
      ) : error ? (
        <div className="mt-8 rounded-2xl border border-red-900 bg-red-950/30 p-8 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-700 bg-gray-900 p-10 text-center">
          <FaHistory className="mx-auto text-4xl text-gray-700" />
          <h3 className="mt-4 text-xl font-bold">No actions logged yet</h3>
          <p className="mt-2 text-gray-400">
            Admin actions will appear here as they happen.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
          {logs.map((log) => {
            const Icon = TARGET_ICONS[log.targetType] || FaHistory;

            return (
              <div
                key={log._id}
                className="flex items-start gap-4 border-b border-gray-800 p-4 last:border-b-0"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                  <Icon className="text-sm" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {ACTION_LABELS[log.action] || log.action}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-gray-400">
                    {describeLog(log)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    by {log.admin?.username || "Unknown admin"} ·{" "}
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
