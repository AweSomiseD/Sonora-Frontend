import { useState } from "react";
import { FaHistory } from "react-icons/fa";
import { Badge, EmptyState, ErrorState, LoadMore, PageHeader, Select, SkeletonList } from "../components/ui/index.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import usePaginatedList from "../hooks/usePaginatedList.js";
import { timeAgo } from "../utils/format.js";

const ACTION_LABELS = {
  USER_ROLE_CHANGED: "Role changed",
  ADMIN_ROLE_CHANGED: "Admin role changed",
  USER_BANNED: "User banned",
  USER_UNBANNED: "User unbanned",
  USER_DELETED: "User deleted",
  USER_WARNED: "User warned",
  MUSIC_DELETED: "Track deleted",
  MUSIC_HIDDEN: "Track hidden",
  MUSIC_RESTORED: "Track restored",
  ALBUM_DELETED: "Album deleted",
  ALBUM_HIDDEN: "Album hidden",
  PLAYLIST_HIDDEN: "Playlist hidden",
  PLAYLIST_DELETED: "Playlist deleted",
  ARTIST_REQUEST_APPROVED: "Artist request approved",
  ARTIST_REQUEST_REJECTED: "Artist request rejected",
  ARTIST_REVOKED: "Artist access revoked",
  ARTIST_RESTORED: "Artist access granted",
  REPORT_RESOLVED: "Report resolved",
  REPORT_DISMISSED: "Report dismissed",
};

const toneFor = (action) => {
  if (/DELETED|BANNED|REVOKED|REJECTED/.test(action)) return "red";
  if (/HIDDEN|WARNED/.test(action)) return "yellow";
  if (/APPROVED|RESTORED|UNBANNED|RESOLVED/.test(action)) return "green";
  return "violet";
};

// Shows a few useful details without dumping raw JSON
const describe = (details = {}) =>
  ["username", "title", "artistName", "reason", "action", "note", "role", "from", "to"]
    .filter((key) => details[key] !== undefined && details[key] !== null && details[key] !== "")
    .map((key) => `${key}: ${Array.isArray(details[key]) ? details[key].join(", ") : details[key]}`)
    .join(" · ");

const OPTIONS = [{ value: "all", label: "All actions" }, ...Object.entries(ACTION_LABELS).map(([value, label]) => ({ value, label }))];

export const AdminAuditLog = () => {
  usePageTitle("Audit log");
  const [action, setAction] = useState("all");
  const list = usePaginatedList("/admin/audit-logs", { action }, { limit: 25 });

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Audit log"
        subtitle="Every admin action, newest first"
        icon={FaHistory}
        actions={<Select aria-label="Filter by action" options={OPTIONS} value={action} onChange={(e) => setAction(e.target.value)} />}
      />
      {list.loading ? (
        <SkeletonList count={10} />
      ) : list.error ? (
        <ErrorState message={list.error} onRetry={list.reload} />
      ) : list.items.length === 0 ? (
        <EmptyState icon={FaHistory} title="No actions yet" message="Admin actions will appear here." />
      ) : (
        <ol className="space-y-2">
          {list.items.map((log) => (
            <li key={log._id} className="rounded-xl border border-violet-500/10 bg-gray-900/60 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={toneFor(log.action)}>{ACTION_LABELS[log.action] || log.action}</Badge>
                <span className="text-sm text-gray-300">
                  by <span className="font-semibold text-white">{log.admin?.username || "deleted admin"}</span>
                </span>
                <span className="text-xs text-gray-500">on {log.targetType}</span>
                <time className="ml-auto text-xs text-gray-500" dateTime={log.createdAt} title={new Date(log.createdAt).toLocaleString()}>
                  {timeAgo(log.createdAt)}
                </time>
              </div>
              {describe(log.details) && <p className="mt-2 break-words text-xs text-gray-400">{describe(log.details)}</p>}
            </li>
          ))}
        </ol>
      )}
      <LoadMore hasMore={list.hasMore} loading={list.loadingMore} onClick={list.loadMore} />
    </div>
  );
};

export default AdminAuditLog;
