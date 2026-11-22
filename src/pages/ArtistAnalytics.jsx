import { useCallback, useEffect, useState } from "react";
import { FaChartLine, FaCrown, FaHeadphones, FaHeart, FaLock, FaMusic, FaUserPlus, FaUsers } from "react-icons/fa";
import { ChartCard, DailyAreaChart, RankedBarChart } from "../components/Charts.jsx";
import StatCard from "../components/StatCard.jsx";
import { Button, ErrorState, Modal, PageHeader, Skeleton, Spinner } from "../components/ui/index.jsx";
import { genreLabel } from "../constants/index.js";
import usePageTitle from "../hooks/usePageTitle.js";
import api, { getErrorCode, getErrorMessage } from "../services/api.js";
import { userTimeZone } from "../utils/format.js";

const RANGES = [7, 30, 90];
const askUpgrade = (feature) =>
  window.dispatchEvent(new CustomEvent("plan:limit", { detail: { code: "PLAN_LIMIT", feature, message: "This is a Premium feature." } }));

function TrackDetails({ track, range, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!track) return;
    setData(null);
    setError("");
    api
      .get(`/analytics/artist/tracks/${track._id}?range=${range}&tz=${encodeURIComponent(userTimeZone())}`)
      .then(({ data: d }) => setData(d))
      .catch((err) => {
        if (getErrorCode(err) === "PLAN_LIMIT") onClose();
        else setError(getErrorMessage(err));
      });
  }, [track, range, onClose]);

  return (
    <Modal open={Boolean(track)} onClose={onClose} title={track?.title} size="lg">
      {error ? (
        <p className="text-sm text-red-300">{error}</p>
      ) : !data ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner className="text-2xl" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
            {[
              ["Plays", data.totals.plays],
              ["Listeners", data.totals.uniqueListeners],
              ["Likes", data.totals.likes],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-gray-900/70 p-3">
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
          <DailyAreaChart data={data.playsPerDay} dataKey="plays" unit="plays" />
          <p className="text-xs text-gray-500">All-time plays: {data.track.playCount}</p>
        </div>
      )}
    </Modal>
  );
}

export default function ArtistAnalytics() {
  usePageTitle("Analytics");
  const [range, setRange] = useState(7);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [trackFor, setTrackFor] = useState(null);

  const load = useCallback(async (days) => {
    setLoading(true);
    setError("");
    try {
      const { data: d } = await api.get(`/analytics/artist/overview?range=${days}&tz=${encodeURIComponent(userTimeZone())}`);
      setData(d);
    } catch (err) {
      if (getErrorCode(err) === "PLAN_LIMIT") setRange(7);
      else setError(getErrorMessage(err, "Could not load analytics"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(range);
  }, [load, range]);

  const closeTrack = useCallback(() => setTrackFor(null), []);
  const maxRange = data?.limits?.analyticsMaxRangeDays ?? 7;
  const trackAnalyticsAllowed = Boolean(data?.limits?.trackAnalytics);

  const pickRange = (days) => {
    if (days > maxRange) return askUpgrade("analytics_range");
    setRange(days);
  };

  const openTrack = (track) => {
    if (!trackAnalyticsAllowed) return askUpgrade("track_analytics");
    setTrackFor(track);
  };

  const rangeSelector = (
    <div role="radiogroup" aria-label="Date range" className="flex rounded-xl border border-violet-500/10 bg-gray-900/60 p-1">
      {RANGES.map((days) => {
        const locked = days > maxRange;
        return (
          <button
            key={days}
            type="button"
            role="radio"
            aria-checked={range === days}
            onClick={() => pickRange(days)}
            className={`inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-sm font-medium ${range === days ? "bg-violet-500/25 text-white" : "text-gray-400 hover:text-white"}`}
          >
            {locked && <FaLock className="text-xs text-amber-300" aria-label="Premium" />} {days} days
          </button>
        );
      })}
    </div>
  );

  if (error) return <ErrorState message={error} onRetry={() => load(range)} />;

  return (
    <div className="animate-fade-in-up space-y-6">
      <PageHeader title="Analytics" subtitle={`Last ${range} days, in your time zone`} icon={FaChartLine} actions={rangeSelector} />

      {!data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-72" />
        </>
      ) : (
        <div className={`space-y-6 transition-opacity ${loading ? "opacity-60" : ""}`} aria-busy={loading}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={FaHeadphones} label="Plays" value={data.totals.plays} />
            <StatCard icon={FaUsers} label="Unique listeners" value={data.totals.uniqueListeners} tone="fuchsia" />
            <StatCard icon={FaUserPlus} label="Followers" value={data.totals.followers} tone="emerald" hint={`+${data.totals.newFollowers} in this range`} />
            <StatCard icon={FaHeart} label="Likes (all tracks)" value={data.totals.likes} tone="amber" hint={`${data.totals.tracks} tracks`} />
          </div>

          <ChartCard
            title="Plays per day"
            rows={data.playsPerDay}
            columns={[
              { key: "date", label: "Date" },
              { key: "plays", label: "Plays" },
            ]}
            empty={data.totals.plays === 0}
            emptyText="No plays in this range yet. Share your tracks to get started."
          >
            <DailyAreaChart data={data.playsPerDay} dataKey="plays" unit="plays" />
          </ChartCard>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border border-violet-500/10 bg-gray-900/60 p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="font-bold text-white">Top tracks</h2>
                {!trackAnalyticsAllowed && (
                  <button type="button" onClick={() => askUpgrade("track_analytics")} className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-amber-300 hover:underline">
                    <FaCrown aria-hidden="true" /> Per-track stats
                  </button>
                )}
              </div>
              {data.topTracks.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-500">No plays yet.</p>
              ) : (
                <ol className="space-y-1">
                  {data.topTracks.map((t, i) => (
                    <li key={t._id}>
                      <button type="button" onClick={() => openTrack(t)} className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-white/5">
                        <span className="w-5 text-center text-xs text-gray-500">{i + 1}</span>
                        {t.coverImage ? <img src={t.coverImage} alt="" className="h-10 w-10 rounded-lg object-cover" loading="lazy" /> : <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300"><FaMusic /></span>}
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{t.title}</span>
                        <span className="text-sm tabular-nums text-gray-300">{t.plays}</span>
                        {!trackAnalyticsAllowed && <FaLock className="text-xs text-gray-600" aria-hidden="true" />}
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <ChartCard
              title="Plays by genre"
              rows={data.genreSplit.map((g) => ({ genre: genreLabel(g.genre), plays: g.plays }))}
              columns={[
                { key: "genre", label: "Genre" },
                { key: "plays", label: "Plays" },
              ]}
              empty={data.genreSplit.length === 0}
            >
              <RankedBarChart data={data.genreSplit.map((g) => ({ name: genreLabel(g.genre), value: g.plays }))} unit="plays" />
            </ChartCard>
          </div>

          {maxRange < 90 && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-center sm:flex-row sm:text-left">
              <FaCrown className="text-2xl text-amber-300" aria-hidden="true" />
              <p className="flex-1 text-sm text-gray-300">Premium artists see 30 and 90 day trends, per-track stats and can publish unlimited tracks.</p>
              <Button onClick={() => askUpgrade("analytics_range")}>See Premium</Button>
            </div>
          )}
        </div>
      )}
      <TrackDetails track={trackFor} range={range} onClose={closeTrack} />
    </div>
  );
}
