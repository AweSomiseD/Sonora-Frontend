import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGlobe, FaListUl, FaLock, FaPlus } from "react-icons/fa";
import PlaylistFormModal from "../components/PlaylistFormModal.jsx";
import { Button, EmptyState, ErrorState, PageHeader, SkeletonGrid } from "../components/ui/index.jsx";
import { PLAN_LIMITS } from "../constants/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import api, { getErrorMessage } from "../services/api.js";
import { timeAgo } from "../utils/format.js";

export default function Playlists() {
  usePageTitle("Playlists");
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const { data } = await api.get("/playlists/mine");
      setItems(data.items);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load playlists"));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (values) => {
    const { data } = await api.post("/playlists", values);
    showToast("Playlist created", "success");
    navigate(`/listener/playlists/${data.playlist._id}`);
  };

  const premium = ["premium", "past_due"].includes(user?.subscriptionStatus);
  const limit = premium ? null : PLAN_LIMITS.listener.free.maxPlaylists;

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Your playlists"
        subtitle={items && limit ? `${items.length} of ${limit} on the free plan` : undefined}
        icon={FaListUl}
        actions={
          <Button icon={FaPlus} onClick={() => setCreating(true)}>
            New playlist
          </Button>
        }
      />
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !items ? (
        <SkeletonGrid count={6} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={FaListUl}
          title="No playlists yet"
          message="Make one, then add songs from any track's menu."
          action={
            <Button icon={FaPlus} onClick={() => setCreating(true)}>
              Create your first playlist
            </Button>
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((p) => (
            <li key={p._id}>
              <Link to={`/listener/playlists/${p._id}`} className="group block rounded-2xl border border-violet-500/10 bg-gray-900/60 p-4 transition hover:border-violet-400/40 hover:bg-gray-800/60">
                <div className="mb-3 flex aspect-square items-center justify-center rounded-xl bg-linear-to-br from-violet-600/40 via-fuchsia-600/20 to-gray-900 text-4xl text-violet-200">
                  <FaListUl aria-hidden="true" />
                </div>
                <p className="truncate font-semibold text-white">{p.name}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400">
                  {p.isPublic ? <FaGlobe aria-label="Public" /> : <FaLock aria-label="Private" />}
                  {p.trackCount} track{p.trackCount === 1 ? "" : "s"} · updated {timeAgo(p.updatedAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <PlaylistFormModal open={creating} onClose={() => setCreating(false)} onSubmit={create} />
    </div>
  );
}
