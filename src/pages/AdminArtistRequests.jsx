import { useState } from "react";
import { FaCheck, FaExternalLinkAlt, FaMicrophone, FaTimes } from "react-icons/fa";
import { Badge, Button, EmptyState, ErrorState, LoadMore, Modal, PageHeader, SkeletonList, Tabs, Textarea } from "../components/ui/index.jsx";
import { genreLabel } from "../constants/index.js";
import { useNotifications } from "../context/NotificationContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import usePaginatedList from "../hooks/usePaginatedList.js";
import api, { getErrorMessage } from "../services/api.js";
import { formatDate, timeAgo } from "../utils/format.js";

const STATUS_TONE = { pending: "yellow", approved: "green", rejected: "red", cancelled: "gray" };

export default function AdminArtistRequests() {
  usePageTitle("Artist requests");
  const { showToast } = useToast();
  const { pendingCounts } = useNotifications();
  const [status, setStatus] = useState("pending");
  const list = usePaginatedList("/admin/artist-requests", { status }, { limit: 20 });
  const [selected, setSelected] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [busy, setBusy] = useState("");

  const updateItem = (request) => {
    // Once handled, a request leaves the "pending" tab
    list.setItems((items) => (status === "pending" ? items.filter((r) => r._id !== request._id) : items.map((r) => (r._id === request._id ? { ...r, ...request } : r))));
    if (status === "pending") list.setTotal((t) => Math.max(0, t - 1));
  };

  const approve = async (request) => {
    setBusy(`approve-${request._id}`);
    try {
      const { data } = await api.patch(`/admin/artist-requests/${request._id}/approve`);
      updateItem(data.request);
      setSelected(null);
      showToast(`${request.artistName} is now an artist`, "success");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setBusy("");
    }
  };

  const reject = async () => {
    if (reason.trim().length < 3) {
      setReasonError("Please give a reason (at least 3 characters). The applicant will see it.");
      return;
    }
    setBusy("reject");
    try {
      const { data } = await api.patch(`/admin/artist-requests/${rejecting._id}/reject`, { reason: reason.trim() });
      updateItem(data.request);
      setRejecting(null);
      setSelected(null);
      setReason("");
      showToast("Request rejected", "success");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setBusy("");
    }
  };

  const openReject = (request) => {
    setRejecting(request);
    setReason("");
    setReasonError("");
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Artist requests" subtitle="Approve listeners who want to publish music" icon={FaMicrophone} />
      <Tabs
        className="mb-5 w-fit max-w-full"
        value={status}
        onChange={setStatus}
        tabs={[
          { value: "pending", label: "Pending", count: pendingCounts.artistRequests },
          { value: "approved", label: "Approved" },
          { value: "rejected", label: "Rejected" },
          { value: "cancelled", label: "Cancelled" },
          { value: "all", label: "All" },
        ]}
      />

      {list.loading ? (
        <SkeletonList count={6} />
      ) : list.error ? (
        <ErrorState message={list.error} onRetry={list.reload} />
      ) : list.items.length === 0 ? (
        <EmptyState icon={FaMicrophone} title={status === "pending" ? "All caught up" : "No requests"} message={status === "pending" ? "There are no requests waiting for review." : "Nothing in this list yet."} />
      ) : (
        <ul className="space-y-2">
          {list.items.map((request) => (
            <li key={request._id} className="flex flex-col gap-3 rounded-xl border border-violet-500/10 bg-gray-900/60 p-4 md:flex-row md:items-center">
              <button type="button" onClick={() => setSelected(request)} className="min-w-0 flex-1 cursor-pointer text-left">
                <p className="flex flex-wrap items-center gap-2 font-semibold text-white">
                  {request.artistName}
                  <Badge tone={STATUS_TONE[request.status]}>{request.status}</Badge>
                </p>
                <p className="truncate text-xs text-gray-400">
                  @{request.user?.username || "deleted user"} · applied {timeAgo(request.createdAt)}
                  {request.genres?.length ? ` · ${request.genres.map(genreLabel).join(", ")}` : ""}
                </p>
                {request.bio && <p className="mt-1 line-clamp-1 text-sm text-gray-300">{request.bio}</p>}
              </button>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setSelected(request)}>
                  Details
                </Button>
                {request.status === "pending" && (
                  <>
                    <Button size="sm" icon={FaCheck} loading={busy === `approve-${request._id}`} onClick={() => approve(request)}>
                      Approve
                    </Button>
                    <Button size="sm" variant="danger" icon={FaTimes} onClick={() => openReject(request)}>
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <LoadMore hasMore={list.hasMore} loading={list.loadingMore} onClick={list.loadMore} />

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.artistName}
        size="lg"
        footer={
          selected?.status === "pending" && (
            <>
              <Button variant="danger" icon={FaTimes} onClick={() => openReject(selected)}>
                Reject
              </Button>
              <Button icon={FaCheck} loading={busy === `approve-${selected?._id}`} onClick={() => approve(selected)}>
                Approve
              </Button>
            </>
          )
        }
      >
        {selected && (
          <dl className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge tone={STATUS_TONE[selected.status]}>{selected.status}</Badge>
              {selected.user?.emailVerified === false && <Badge tone="gray">Email not verified</Badge>}
            </div>
            <div>
              <dt className="text-xs uppercase text-gray-500">Applicant</dt>
              <dd className="text-gray-200">
                @{selected.user?.username} · {selected.user?.email} · member since {formatDate(selected.user?.createdAt)}
              </dd>
            </div>
            {selected.bio && (
              <div>
                <dt className="text-xs uppercase text-gray-500">Bio</dt>
                <dd className="whitespace-pre-wrap text-gray-200">{selected.bio}</dd>
              </div>
            )}
            {selected.genres?.length > 0 && (
              <div>
                <dt className="text-xs uppercase text-gray-500">Genres</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {selected.genres.map((g) => (
                    <Badge key={g} tone="violet">{genreLabel(g)}</Badge>
                  ))}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs uppercase text-gray-500">Sample links</dt>
              <dd>
                {selected.links?.length ? (
                  <ul className="mt-1 space-y-1">
                    {selected.links.map((link) => (
                      <li key={link}>
                        <a href={link} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 break-all text-violet-300 hover:underline">
                          {link} <FaExternalLinkAlt className="shrink-0 text-xs" aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-500">No links given</span>
                )}
              </dd>
            </div>
            {selected.reason && (
              <div>
                <dt className="text-xs uppercase text-gray-500">Why they want to join</dt>
                <dd className="whitespace-pre-wrap text-gray-200">{selected.reason}</dd>
              </div>
            )}
            {selected.rejectionReason && (
              <div>
                <dt className="text-xs uppercase text-gray-500">Rejection reason</dt>
                <dd className="text-red-300">{selected.rejectionReason}</dd>
              </div>
            )}
            <p className="text-xs text-gray-500">
              Applied {formatDate(selected.createdAt)}
              {selected.reviewedAt ? ` · reviewed ${formatDate(selected.reviewedAt)}` : ""}
            </p>
          </dl>
        )}
      </Modal>

      <Modal
        open={Boolean(rejecting)}
        onClose={() => setRejecting(null)}
        title={`Reject ${rejecting?.artistName}?`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejecting(null)} disabled={busy === "reject"}>
              Cancel
            </Button>
            <Button variant="danger" loading={busy === "reject"} onClick={reject}>
              Reject request
            </Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-gray-300">They can apply again after the cooldown. Tell them what to improve.</p>
        <Textarea
          label="Reason"
          required
          value={reason}
          maxLength={500}
          rows={4}
          error={reasonError}
          onChange={(e) => {
            setReason(e.target.value);
            setReasonError("");
          }}
        />
      </Modal>
    </div>
  );
}
