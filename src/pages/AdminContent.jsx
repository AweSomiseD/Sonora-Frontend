import { useState } from "react";
import { FaCompactDisc, FaEye, FaEyeSlash, FaMusic, FaSearch, FaTrash } from "react-icons/fa";
import { Badge, Button, ConfirmDialog, EmptyState, ErrorState, Input, LoadMore, PageHeader, Select, SkeletonList, Tabs } from "../components/ui/index.jsx";
import { useToast } from "../context/ToastContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import usePaginatedList from "../hooks/usePaginatedList.js";
import api, { getErrorMessage } from "../services/api.js";
import { artistName, formatCount, formatDate } from "../utils/format.js";

const STATUS = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "hidden", label: "Hidden" },
];

export const AdminContent = () => {
  usePageTitle("Content");
  const { showToast } = useToast();
  const [tab, setTab] = useState("music");
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({ search: "", status: "all" });
  const list = usePaginatedList(tab === "music" ? "/admin/content/music" : "/admin/content/albums", filters, { limit: 20 });
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const toggleVisibility = async (music) => {
    const status = music.status === "hidden" ? "published" : "hidden";
    try {
      const { data } = await api.patch(`/admin/music/${music._id}/visibility`, { status });
      list.setItems((items) => items.map((m) => (m._id === music._id ? { ...m, ...data.music } : m)));
      showToast(data.message, "success");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      const path = tab === "music" ? `/admin/music/${confirm._id}` : `/admin/album/${confirm._id}`;
      const { data } = await api.delete(path);
      list.setItems((items) => items.filter((i) => i._id !== confirm._id));
      list.setTotal((t) => Math.max(0, t - 1));
      showToast(data.message, "success");
      setConfirm(null);
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Content" subtitle="Hide or remove tracks and albums" icon={FaMusic} />
      <Tabs
        className="mb-4 w-fit"
        tabs={[
          { value: "music", label: "Tracks" },
          { value: "album", label: "Albums" },
        ]}
        value={tab}
        onChange={(value) => {
          setTab(value);
          setFilters((f) => ({ ...f }));
        }}
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setFilters((f) => ({ ...f, search: searchInput.trim() }));
          }}
        >
          <div className="flex-1">
            <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder={`Search ${tab === "music" ? "tracks" : "albums"} by title`} aria-label="Search content" maxLength={50} />
          </div>
          <Button type="submit" variant="secondary" icon={FaSearch} aria-label="Search" />
        </form>
        <Select aria-label="Visibility" options={STATUS} value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} />
      </div>

      {list.loading ? (
        <SkeletonList count={8} />
      ) : list.error ? (
        <ErrorState message={list.error} onRetry={list.reload} />
      ) : list.items.length === 0 ? (
        <EmptyState icon={tab === "music" ? FaMusic : FaCompactDisc} title="Nothing here" message="No content matches these filters." />
      ) : (
        <ul className="space-y-2">
          {list.items.map((item) => (
            <li key={item._id} className="flex flex-col gap-3 rounded-xl border border-violet-500/10 bg-gray-900/60 p-3 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {item.coverImage ? (
                  <img src={item.coverImage} alt="" className="h-12 w-12 rounded-lg object-cover" loading="lazy" />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">{tab === "music" ? <FaMusic /> : <FaCompactDisc />}</span>
                )}
                <div className="min-w-0">
                  <p className="flex items-center gap-2 truncate font-semibold text-white">
                    <span className="truncate">{item.title}</span>
                    {item.status === "hidden" && <Badge tone="red">Hidden</Badge>}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    {artistName(item.artist)} · {formatDate(item.createdAt)}
                    {tab === "music" ? ` · ${formatCount(item.playCount || 0)} plays` : ` · ${item.trackCount} tracks`}
                  </p>
                  {item.hiddenReason && <p className="text-xs text-red-300">{item.hiddenReason}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                {tab === "music" && (
                  <Button size="sm" variant="secondary" icon={item.status === "hidden" ? FaEye : FaEyeSlash} onClick={() => toggleVisibility(item)}>
                    {item.status === "hidden" ? "Restore" : "Hide"}
                  </Button>
                )}
                <Button size="sm" variant="danger" icon={FaTrash} onClick={() => setConfirm(item)}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <LoadMore hasMore={list.hasMore} loading={list.loadingMore} onClick={list.loadMore} />

      <ConfirmDialog
        open={Boolean(confirm)}
        title={`Delete "${confirm?.title}"?`}
        message={tab === "music" ? "The track, its files, likes, playlist entries and play history are removed. This cannot be undone." : "The album is removed. Its tracks stay available as singles."}
        confirmLabel="Delete"
        loading={busy}
        onConfirm={remove}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
};

export default AdminContent;
