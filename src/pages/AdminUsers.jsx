import { useState } from "react";
import { FaBan, FaCheckCircle, FaEllipsisV, FaSearch, FaTrash, FaUserShield, FaUsers } from "react-icons/fa";
import { Avatar, Badge, Button, ConfirmDialog, EmptyState, ErrorState, Input, LoadMore, PageHeader, Select, SkeletonList, Textarea } from "../components/ui/index.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import usePaginatedList from "../hooks/usePaginatedList.js";
import api, { getErrorMessage } from "../services/api.js";
import { formatDate } from "../utils/format.js";

const ROLE_FILTERS = [
  { value: "all", label: "All roles" },
  { value: "listener", label: "Listeners" },
  { value: "artist", label: "Artists" },
  { value: "admin", label: "Admins" },
];
const STATUS_FILTERS = [
  { value: "all", label: "Any status" },
  { value: "active", label: "Active" },
  { value: "banned", label: "Banned" },
];
const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "username", label: "Username" },
];
const ROLE_TONE = { listener: "violet", artist: "fuchsia", admin: "yellow" };

export const AdminUsers = () => {
  usePageTitle("Users");
  const { user: me } = useAuth();
  const { showToast } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({ search: "", role: "all", status: "all", sort: "newest" });
  const list = usePaginatedList("/admin/users", filters, { limit: 20 });
  // action = { type: "ban" | "unban" | "delete" | "revoke" | "grant" | "admin-grant" | "admin-revoke", user }
  const [action, setAction] = useState(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [menuFor, setMenuFor] = useState(null);

  const replaceUser = (updated) => list.setItems((items) => items.map((u) => (u._id === updated._id ? updated : u)));

  const run = async () => {
    if (!action) return;
    const { type, user } = action;
    setBusy(true);
    try {
      let response;
      if (type === "ban" || type === "unban") response = await api.patch(`/admin/users/${user._id}/ban`, { reason: reason.trim() });
      if (type === "delete") response = await api.delete(`/admin/users/${user._id}`);
      if (type === "revoke") response = await api.patch(`/admin/users/${user._id}/revoke-artist`, { reason: reason.trim() });
      if (type === "grant") response = await api.patch(`/admin/users/${user._id}/grant-artist`);
      if (type === "admin-grant" || type === "admin-revoke") response = await api.patch(`/admin/users/${user._id}/admin`, { action: type === "admin-grant" ? "grant" : "revoke" });

      if (type === "delete") {
        list.setItems((items) => items.filter((u) => u._id !== user._id));
        list.setTotal((t) => Math.max(0, t - 1));
      } else if (response?.data?.user) {
        replaceUser(response.data.user);
      }
      showToast(response?.data?.message || "Done", "success");
      setAction(null);
      setReason("");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setBusy(false);
    }
  };

  const dialogText = action && {
    ban: { title: `Ban ${action.user.username}?`, message: "They are logged out right away and cannot log in until you unban them.", confirm: "Ban user", withReason: true },
    unban: { title: `Unban ${action.user.username}?`, message: "They will be able to log in again.", confirm: "Unban", tone: "primary" },
    delete: { title: `Delete ${action.user.username}?`, message: "This permanently deletes the account and all their music, albums, playlists, messages and files. This cannot be undone.", confirm: "Delete forever" },
    revoke: { title: `Remove artist access from ${action.user.username}?`, message: "Their tracks and albums are hidden and they go back to Listener mode. You can restore access later.", confirm: "Revoke artist", withReason: true },
    grant: { title: `Make ${action.user.username} an artist?`, message: "They get artist access right away, without an application.", confirm: "Grant artist", tone: "primary" },
    "admin-grant": { title: `Make ${action.user.username} an admin?`, message: "Admins can ban users and delete any content.", confirm: "Make admin", tone: "primary" },
    "admin-revoke": { title: `Remove admin from ${action.user.username}?`, message: "They lose access to the admin dashboard.", confirm: "Remove admin" },
  }[action.type];

  const submitSearch = (event) => {
    event.preventDefault();
    setFilters((f) => ({ ...f, search: searchInput.trim() }));
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Users" subtitle={`${list.total} account${list.total === 1 ? "" : "s"}`} icon={FaUsers} />

      <div className="mb-5 grid gap-3 xl:grid-cols-[1fr_auto_auto_auto]">
        <form onSubmit={submitSearch} className="flex gap-2">
          <div className="flex-1">
            <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search username or email" aria-label="Search users" maxLength={50} />
          </div>
          <Button type="submit" variant="secondary" icon={FaSearch} aria-label="Search" />
        </form>
        <Select aria-label="Role" options={ROLE_FILTERS} value={filters.role} onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))} />
        <Select aria-label="Status" options={STATUS_FILTERS} value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} />
        <Select aria-label="Sort" options={SORTS} value={filters.sort} onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))} />
      </div>

      {list.loading ? (
        <SkeletonList count={8} />
      ) : list.error ? (
        <ErrorState message={list.error} onRetry={list.reload} />
      ) : list.items.length === 0 ? (
        <EmptyState icon={FaUsers} title="No users found" message="Try a different search or filter." />
      ) : (
        <ul className="space-y-2">
          {list.items.map((u) => {
            const isMe = u._id === me?._id;
            const isAdminUser = u.roles.includes("admin");
            const isArtistUser = u.roles.includes("artist");
            return (
              <li key={u._id} className="flex flex-col gap-3 rounded-xl border border-violet-500/10 bg-gray-900/60 p-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar src={u.avatar} name={u.username} />
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-semibold text-white">
                      <span className="truncate">{u.username}</span>
                      {isMe && <Badge tone="gray">You</Badge>}
                      {u.isBanned && <Badge tone="red">Banned</Badge>}
                      {u.subscriptionStatus === "premium" && <Badge tone="yellow">Premium</Badge>}
                    </p>
                    <p className="truncate text-xs text-gray-400">{u.email} · joined {formatDate(u.createdAt)}</p>
                    {u.isBanned && u.banReason && <p className="mt-1 text-xs text-red-300">Reason: {u.banReason}</p>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {u.roles.map((r) => (
                    <Badge key={r} tone={ROLE_TONE[r]}>{r}</Badge>
                  ))}
                  {!u.emailVerified && <Badge tone="gray">Unverified</Badge>}
                </div>
                {!isMe && (
                  <div className="relative flex gap-2">
                    {!isAdminUser && (
                      <Button size="sm" variant={u.isBanned ? "secondary" : "danger"} icon={u.isBanned ? FaCheckCircle : FaBan} onClick={() => setAction({ type: u.isBanned ? "unban" : "ban", user: u })}>
                        {u.isBanned ? "Unban" : "Ban"}
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" icon={FaEllipsisV} aria-label={`More actions for ${u.username}`} aria-expanded={menuFor === u._id} onClick={() => setMenuFor(menuFor === u._id ? null : u._id)} />
                    {menuFor === u._id && (
                      <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-xl border border-violet-500/20 bg-gray-950 p-1 shadow-xl" role="menu" onMouseLeave={() => setMenuFor(null)}>
                        {[
                          isArtistUser ? { type: "revoke", label: "Revoke artist access" } : { type: "grant", label: "Grant artist access" },
                          isAdminUser ? { type: "admin-revoke", label: "Remove admin role" } : { type: "admin-grant", label: "Make admin", icon: FaUserShield },
                          !isAdminUser && { type: "delete", label: "Delete account", danger: true },
                        ]
                          .filter(Boolean)
                          .map((item) => (
                            <button
                              key={item.type}
                              role="menuitem"
                              type="button"
                              onClick={() => {
                                setMenuFor(null);
                                setAction({ type: item.type, user: u });
                              }}
                              className={`flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-left text-sm hover:bg-violet-500/10 ${item.danger ? "text-red-300" : "text-gray-200"}`}
                            >
                              {item.danger && <FaTrash aria-hidden="true" />} {item.label}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <LoadMore hasMore={list.hasMore} loading={list.loadingMore} onClick={list.loadMore} />

      <ConfirmDialog
        open={Boolean(action)}
        title={dialogText?.title}
        message={dialogText?.message}
        confirmLabel={dialogText?.confirm}
        tone={dialogText?.tone || "danger"}
        loading={busy}
        onConfirm={run}
        onCancel={() => {
          setAction(null);
          setReason("");
        }}
      >
        {dialogText?.withReason && (
          <div className="mt-4">
            <Textarea label="Reason (shown to the user)" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} rows={3} />
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
};

export default AdminUsers;
