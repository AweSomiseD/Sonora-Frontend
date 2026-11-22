import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaChartPie, FaClock, FaHeadphones, FaPlay } from "react-icons/fa";
import StatCard from "../components/StatCard.jsx";
import { TrackRow } from "../components/MusicCard.jsx";
import { Avatar, EmptyState, ErrorState, PageHeader, Skeleton } from "../components/ui/index.jsx";
import { usePlayer } from "../context/PlayerContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import api, { getErrorMessage } from "../services/api.js";
import { formatCount } from "../utils/format.js";

export default function ListenerStats() {
  usePageTitle("Your stats");
  const { playQueue } = usePlayer();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const { data: d } = await api.get("/analytics/listener/me");
      setData(d);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load your stats"));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-60" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const month = new Date(data.since).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const hours = data.minutesListened >= 120 ? `${Math.round(data.minutesListened / 60)} hours` : `${data.minutesListened} minutes`;

  return (
    <div className="animate-fade-in-up space-y-6">
      <PageHeader title="Your stats" subtitle={month} icon={FaChartPie} />
      {data.totalPlays === 0 ? (
        <EmptyState icon={FaHeadphones} title="Nothing yet this month" message="Plays count after 30 seconds (or half of a short track). Start listening!" action={<Link to="/listener/discover" className="font-semibold text-violet-300 hover:underline">Discover music</Link>} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard icon={FaHeadphones} label="Plays this month" value={data.totalPlays} />
            <StatCard icon={FaClock} label="Time listened" value={hours} tone="fuchsia" />
            <StatCard icon={FaPlay} label="Top artist" value={data.topArtists[0]?.displayName || "-"} tone="emerald" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <section className="rounded-2xl border border-violet-500/10 bg-gray-900/60 p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold text-white">Top tracks</h2>
                <button type="button" onClick={() => playQueue(data.topTracks, 0)} className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-semibold text-violet-300 hover:bg-violet-500/10">
                  <FaPlay aria-hidden="true" /> Play all
                </button>
              </div>
              <ol className="space-y-1">
                {data.topTracks.map((t, i) => (
                  <TrackRow key={t._id} music={t} list={data.topTracks} index={i} number={i + 1} extra={`${formatCount(t.plays)} plays`} />
                ))}
              </ol>
            </section>
            <section className="rounded-2xl border border-violet-500/10 bg-gray-900/60 p-5">
              <h2 className="mb-3 font-bold text-white">Top artists</h2>
              <ol className="space-y-2">
                {data.topArtists.map((a, i) => (
                  <li key={a._id}>
                    <Link to={`/listener/artists/${a._id}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-white/5">
                      <span className="w-5 text-center text-xs text-gray-500">{i + 1}</span>
                      <Avatar src={a.avatar} name={a.displayName} size="sm" />
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{a.displayName}</span>
                      <span className="text-xs text-gray-400">{formatCount(a.plays)} plays</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
