import { useState } from "react";
import { FaFlag } from "react-icons/fa";
import { Badge, Button, EmptyState, ErrorState, LoadMore, Modal, PageHeader, Select, SkeletonList, Tabs, Textarea } from "../components/ui/index.jsx";
import { REPORT_REASONS } from "../constants/index.js";
import { useNotifications } from "../context/NotificationContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import usePaginatedList from "../hooks/usePaginatedList.js";
import api, { getErrorMessage } from "../services/api.js";
import { formatDate, timeAgo } from "../utils/format.js";

const TARGETS = [
  { value: "all", label: "All types" },
  { value: "music", label: "Tracks" },
  { value: "album", label: "Albums" },
  { value: "playlist", label: "Playlists" },
  { value: "user", label: "Users" },
];

// Which moderation actions make sense for each kind of target
const ACTIONS_FOR = {
  music: ["dismiss", "warn_artist", "hide_content", "delete_content", "ban_user"],
  album: ["dismiss", "warn_artist", "hide_content", "delete_content", "ban_user"],
  playlist: ["dismiss", "warn_artist", "hide_content", "delete_content", "ban_user"],
  user: ["dismiss", "warn_artist", "ban_user"],
};
const ACTION_INFO = {
  dismiss: { label: "Dismiss", help: "Nothing wrong. Close the report.", tone: "ghost" },
  warn_artist: { label: "Warn owner", help: "Send the owner a warning notification.", tone: "secondary" },
  hide_content: { label: "Hide content", help: "Hide it from everyone. The owner can still see it.", tone: "secondary" },
  delete_content: { label: "Delete content", help: "Permanently delete it and its files.", tone: "danger" },
  ban_user: { label: "Ban owner", help: "Ban the owner and log them out everywhere.", tone: "danger" },
};
const reasonLabel = (value) => REPORT_REASONS.find((r) => r.value === value)?.label || value;
const STATUS_TONE = { open: "yellow", resolved: "green", dismissed: "gray" };

export default function AdminReports() {
  usePageTitle("Reports");
  const { showToast } = useToast();
  const { pendingCounts } = useNotifications();
  const [status, setStatus] = useState("open");
  const [targetType, setTargetType] = useState("all");
  const list = usePaginatedList("/admin/reports", { status, targetType }, { limit: 20 });
  const [handling, setHandling] = useState(null);
  const [action, setAction] = useState("dismiss");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const open = (report) => {
    setHandling(report);
    setAction("dismiss");
    setNote("");
  };

  const submit = async () => {
    setBusy(true);
    try {
      await api.patch(`/admin/reports/${handling._id}`, { action, note: note.trim() });
      // Related open reports on the same item are closed by the server too, so reload
      list.reload();
      setHandling(null);
      showToast("Report handled", "success");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
      if (error?.response?.status === 409) list.reload();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Reports" subtitle="Content flagged by the community" icon={FaFlag} />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          className="w-fit max-w-full"
          value={status}
          onChange={setStatus}
          tabs={[
            { value: "open", label: "Open", count: pendingCounts.reports },
            { value: "resolved", label: "Resolved" },
            { value: "dismissed", label: "Dismissed" },
            { value: "all", label: "All" },
          ]}
        />
        <Select aria-label="Report type" options={TARGETS} value={targetType} onChange={(e) => setTargetType(e.target.value)} />
      </div>

      {list.loading ? (
        <SkeletonList count={6} />
      ) : list.error ? (
        <ErrorState message={list.error} onRetry={list.reload} />
      ) : list.items.length === 0 ? (
        <EmptyState icon={FaFlag} title={status === "open" ? "No open reports" : "Nothing here"} message={status === "open" ? "The community has not flagged anything." : "No reports match these filters."} />
      ) : (
        <ul className="space-y-2">
          {list.items.map((report) => (
            <li key={report._id} className="flex flex-col gap-3 rounded-xl border border-violet-500/10 bg-gray-900/60 p-4 md:flex-row md:items-center">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-semibold text-white">
                  <Badge tone="violet">{report.targetType}</Badge>
                  <span className="truncate">{report.targetLabel || "Untitled"}</span>
                  <Badge tone="red">{reasonLabel(report.reason)}</Badge>
                  <Badge tone={STATUS_TONE[report.status]}>{report.status}</Badge>
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Reported by @{report.reporter?.username || "deleted user"} {timeAgo(report.createdAt)}
                  {report.targetOwner ? ` · owner @${report.targetOwner.username}` : ""}
                </p>
                {report.details && <p className="mt-1 text-sm text-gray-300">“{report.details}”</p>}
                {report.status !== "open" && (
                  <p className="mt-1 text-xs text-gray-500">
                    {ACTION_INFO[report.action]?.label || report.action} by @{report.handledBy?.username || "admin"} on {formatDate(report.handledAt)}
                    {report.resolution ? ` · ${report.resolution}` : ""}
                  </p>
                )}
              </div>
              {report.status === "open" && (
                <Button size="sm" onClick={() => open(report)}>
                  Review
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      <LoadMore hasMore={list.hasMore} loading={list.loadingMore} onClick={list.loadMore} />

      <Modal
        open={Boolean(handling)}
        onClose={() => setHandling(null)}
        title="Handle report"
        footer={
          <>
            <Button variant="ghost" onClick={() => setHandling(null)} disabled={busy}>
              Cancel
            </Button>
            <Button variant={ACTION_INFO[action].tone === "danger" ? "danger" : "primary"} loading={busy} onClick={submit}>
              {ACTION_INFO[action].label}
            </Button>
          </>
        }
      >
        {handling && (
          <div className="space-y-4">
            <p className="text-sm text-gray-300">
              {handling.targetType} <span className="font-semibold text-white">{handling.targetLabel}</span> reported for <span className="font-semibold text-white">{reasonLabel(handling.reason)}</span>.
            </p>
            <fieldset className="space-y-2">
              <legend className="mb-1 text-sm font-medium text-gray-300">Action</legend>
              {ACTIONS_FOR[handling.targetType].map((value) => (
                <label key={value} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${action === value ? "border-violet-400/50 bg-violet-500/10" : "border-violet-500/10 hover:bg-gray-800/50"}`}>
                  <input type="radio" name="report-action" value={value} checked={action === value} onChange={() => setAction(value)} className="mt-1 accent-violet-500" />
                  <span>
                    <span className="block text-sm font-semibold text-white">{ACTION_INFO[value].label}</span>
                    <span className="block text-xs text-gray-400">{ACTION_INFO[value].help}</span>
                  </span>
                </label>
              ))}
            </fieldset>
            <Textarea label="Note (optional, sent with warnings)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={3} />
          </div>
        )}
      </Modal>
    </div>
  );
}
