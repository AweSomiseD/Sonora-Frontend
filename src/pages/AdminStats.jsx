import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBan, FaChartLine, FaCompactDisc, FaFlag, FaMicrophone, FaMusic, FaUserCheck, FaUsers } from "react-icons/fa";
import { ChartCard, DailyAreaChart } from "../components/Charts.jsx";
import StatCard from "../components/StatCard.jsx";
import { Avatar, Badge, ErrorState, PageHeader, Skeleton } from "../components/ui/index.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import api, { getErrorMessage } from "../services/api.js";
import { formatCount, formatDate, userTimeZone } from "../utils/format.js";

export const AdminStats = () => {
  usePageTitle("Platform stats");
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const { data } = await api.get(`/admin/stats?tz=${encodeURIComponent(userTimeZone())}`);
      setStats(data.stats);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load stats"));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!stats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-60" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  const series = stats.series || [];
  const signups30 = series.reduce((sum, d) => sum + d.signups, 0);
  const plays30 = series.reduce((sum, d) => sum + d.plays, 0);

  return (
    <div className="animate-fade-in-up space-y-6">
      <PageHeader title="Platform stats" subtitle="Last 30 days, in your time zone" icon={FaChartLine} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FaUsers} label="Users" value={stats.totalUsers} hint={`${formatCount(signups30)} new in 30 days`} />
        <StatCard icon={FaMicrophone} label="Artists" value={stats.roleCounts.artist} tone="fuchsia" />
        <StatCard icon={FaMusic} label="Tracks" value={stats.totalSongs} tone="emerald" hint={`${formatCount(plays30)} plays in 30 days`} />
        <StatCard icon={FaCompactDisc} label="Albums" value={stats.totalAlbums} tone="amber" />
        <Link to="/admin/artist-requests" className="rounded-2xl focus-visible:outline-2">
          <StatCard icon={FaUserCheck} label="Pending artist requests" value={stats.pendingArtistRequests} tone="fuchsia" hint="Review now" />
        </Link>
        <Link to="/admin/reports" className="rounded-2xl focus-visible:outline-2">
          <StatCard icon={FaFlag} label="Open reports" value={stats.openReports} tone="amber" hint="Review now" />
        </Link>
        <StatCard icon={FaBan} label="Banned users" value={stats.bannedUsers} />
        <StatCard icon={FaUsers} label="Admins" value={stats.roleCounts.admin} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="New sign-ups per day"
          rows={series}
          columns={[
            { key: "date", label: "Date" },
            { key: "signups", label: "Sign-ups" },
          ]}
          empty={signups30 === 0}
        >
          <DailyAreaChart data={series} dataKey="signups" unit="sign-ups" />
        </ChartCard>
        <ChartCard
          title="Plays per day"
          rows={series}
          columns={[
            { key: "date", label: "Date" },
            { key: "plays", label: "Plays" },
          ]}
          empty={plays30 === 0}
        >
          <DailyAreaChart data={series} dataKey="plays" unit="plays" />
        </ChartCard>
      </div>

      <section className="rounded-2xl border border-violet-500/10 bg-gray-900/60 p-5">
        <h2 className="mb-3 font-bold text-white">Newest accounts</h2>
        <ul className="divide-y divide-violet-500/10">
          {stats.recentSignups.map((u) => (
            <li key={u._id} className="flex items-center gap-3 py-2.5">
              <Avatar src={u.avatar} name={u.username} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{u.username}</p>
                <p className="truncate text-xs text-gray-400">{u.email}</p>
              </div>
              <div className="hidden gap-1 sm:flex">
                {u.roles.map((r) => (
                  <Badge key={r} tone={r === "artist" ? "fuchsia" : r === "admin" ? "yellow" : "violet"}>{r}</Badge>
                ))}
              </div>
              <span className="text-xs text-gray-500">{formatDate(u.createdAt)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AdminStats;
