import { useNavigate } from "react-router-dom";
import { FaBell, FaCheckDouble, FaCrown, FaExclamationTriangle, FaMicrophoneAlt, FaMusic, FaUserPlus } from "react-icons/fa";
import { Button, EmptyState, ErrorState, LoadMore, PageHeader, SkeletonList } from "../components/ui/index.jsx";
import { useNotifications } from "../context/NotificationContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import usePaginatedList from "../hooks/usePaginatedList.js";
import { timeAgo } from "../utils/format.js";

const ICONS = {
  artist_request_approved: FaMicrophoneAlt,
  artist_request_rejected: FaMicrophoneAlt,
  artist_revoked: FaExclamationTriangle,
  artist_restored: FaMicrophoneAlt,
  new_release: FaMusic,
  new_follower: FaUserPlus,
  payment_failed: FaCrown,
  subscription: FaCrown,
  warning: FaExclamationTriangle,
};

// Only follow links inside the app
const safeLink = (link) => (typeof link === "string" && link.startsWith("/") && !link.startsWith("//") ? link : null);

export default function Notifications() {
  usePageTitle("Notifications");
  const navigate = useNavigate();
  const { markRead, markAllRead, unread } = useNotifications();
  const list = usePaginatedList("/notifications", {}, { limit: 20 });

  const open = (item) => {
    if (!item.isRead) {
      markRead(item._id);
      list.setItems((items) => items.map((n) => (n._id === item._id ? { ...n, isRead: true } : n)));
    }
    const link = safeLink(item.link);
    if (link) navigate(link);
  };

  const readAll = async () => {
    await markAllRead();
    list.setItems((items) => items.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="animate-fade-in-up mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        subtitle={unread ? `${unread} unread` : "You're all caught up"}
        icon={FaBell}
        actions={
          unread > 0 && (
            <Button variant="secondary" icon={FaCheckDouble} onClick={readAll}>
              Mark all as read
            </Button>
          )
        }
      />
      {list.loading ? (
        <SkeletonList count={6} />
      ) : list.error ? (
        <ErrorState message={list.error} onRetry={list.reload} />
      ) : list.items.length === 0 ? (
        <EmptyState icon={FaBell} title="No notifications" message="Approvals, new releases from artists you follow and account updates show up here." />
      ) : (
        <ul className="space-y-2">
          {list.items.map((item) => {
            const Icon = ICONS[item.type] || FaBell;
            return (
              <li key={item._id}>
                <button
                  type="button"
                  onClick={() => open(item)}
                  className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition ${item.isRead ? "border-violet-500/10 bg-gray-900/40 hover:bg-gray-800/50" : "border-violet-400/30 bg-violet-500/10 hover:bg-violet-500/15"}`}
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-violet-200">
                    <Icon aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className={`font-semibold ${item.isRead ? "text-gray-200" : "text-white"}`}>{item.title}</span>
                      {!item.isRead && <span className="h-2 w-2 rounded-full bg-fuchsia-400" aria-label="Unread" />}
                    </span>
                    {item.body && <span className="mt-0.5 block text-sm text-gray-400">{item.body}</span>}
                    <span className="mt-1 block text-xs text-gray-500">{timeAgo(item.createdAt)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <LoadMore hasMore={list.hasMore} loading={list.loadingMore} onClick={list.loadMore} />
    </div>
  );
}
