import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaChartLine,
  FaCloudUploadAlt,
  FaCompactDisc,
  FaFlag,
  FaHeadphones,
  FaHeart,
  FaListUl,
  FaMusic,
  FaPlay,
  FaUserCheck,
  FaUserFriends,
  FaUsers,
} from "react-icons/fa";
import BecomeArtistCard from "../components/BecomeArtistCard.jsx";
import PremiumBadge from "../components/PremiumBadge.jsx";
import { MusicCard } from "../components/MusicCard.jsx";
import StatCard from "../components/StatCard.jsx";
import {
  Card,
  EmptyState,
  ErrorState,
  SkeletonGrid,
} from "../components/ui/index.jsx";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import api, { getErrorMessage } from "../services/api.js";

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12
    ? "Good morning"
    : hour < 18
      ? "Good afternoon"
      : "Good evening";
};

function QuickLink({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="flex min-h-12 items-center gap-3 rounded-xl border border-violet-500/10 bg-gray-900/60 px-4 text-sm font-semibold text-gray-200 transition hover:border-violet-500/30 hover:text-white"
    >
      <Icon className="text-violet-300" aria-hidden="true" /> {label}
    </Link>
  );
}

function ListenerHome({ user }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    Promise.all([api.get("/music/discover"), api.get("/playlists/mine")])
      .then(([discover, playlists]) =>
        setData({ ...discover.data, playlists: playlists.data.items }),
      )
      .catch((err) => setError(getErrorMessage(err)));
  };
  useEffect(load, []);

  return (
    <div className="space-y-8">
      <BecomeArtistCard />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FaHeart}
          label="Liked songs"
          value={user?.likedMusics?.length || 0}
          tone="fuchsia"
        />
        <StatCard
          icon={FaUserFriends}
          label="Following"
          value={user?.followedArtists?.length || 0}
        />
        <StatCard
          icon={FaListUl}
          label="Playlists"
          value={data?.playlists?.length ?? "–"}
          tone="emerald"
        />
        <StatCard
          icon={FaHeadphones}
          label="Plan"
          value={user?.isPremium ? "Premium" : "Free"}
          tone="amber"
        />
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {!data && !error && <SkeletonGrid count={5} />}
      {data && (
        <>
          <Section
            title="Jump back in"
            to="/listener/recently-played"
            tracks={data.recentlyPlayed}
            empty="Songs you play will show up here."
          />
          <Section
            title="New from artists you follow"
            to="/listener/following"
            tracks={data.fromFollowed}
            empty="Follow artists to see their new releases here."
          />
          <Section
            title="Trending this week"
            to="/listener/discover"
            tracks={data.trending}
            empty="Nothing trending yet. Be the first to listen!"
          />
        </>
      )}
    </div>
  );
}

function Section({ title, to, tracks, empty }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {to && (
          <Link
            to={to}
            className="text-sm font-semibold text-violet-300 hover:text-violet-100"
          >
            See all
          </Link>
        )}
      </div>
      {tracks?.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {tracks.slice(0, 6).map((music, index) => (
            <MusicCard
              key={music._id}
              music={music}
              list={tracks}
              index={index}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-violet-500/15 px-4 py-6 text-center text-sm text-gray-500">
          {empty}
        </p>
      )}
    </section>
  );
}

function ArtistHome() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const load = () => {
    setError("");
    Promise.all([
      api.get("/music/my-music"),
      api.get("/music/my-albums"),
      api.get(`/analytics/artist/overview?range=7`),
    ])
      .then(([music, albums, analytics]) =>
        setStats({
          music: music.data.items,
          albums: albums.data.items,
          analytics: analytics.data,
        }),
      )
      .catch((err) => setError(getErrorMessage(err)));
  };
  useEffect(load, []);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!stats) return <SkeletonGrid count={4} />;
  const totals = stats.analytics.totals;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FaMusic} label="Tracks" value={stats.music.length} />
        <StatCard
          icon={FaCompactDisc}
          label="Albums"
          value={stats.albums.length}
          tone="fuchsia"
        />
        <StatCard
          icon={FaPlay}
          label="Plays (7 days)"
          value={totals.plays}
          tone="emerald"
        />
        <StatCard
          icon={FaUsers}
          label="Followers"
          value={totals.followers}
          tone="amber"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <QuickLink
          to="/artist/upload-music"
          icon={FaCloudUploadAlt}
          label="Upload a song"
        />
        <QuickLink
          to="/artist/create-album"
          icon={FaCompactDisc}
          label="Create an album"
        />
        <QuickLink
          to="/artist/analytics"
          icon={FaChartLine}
          label="Open analytics"
        />
      </div>
      <Card>
        <h2 className="mb-3 text-lg font-bold text-white">
          Your latest uploads
        </h2>
        {stats.music.length === 0 ? (
          <EmptyState
            icon={FaMusic}
            title="No music yet"
            message="Upload your first song to start building your audience."
            action={
              <QuickLink
                to="/artist/upload-music"
                icon={FaCloudUploadAlt}
                label="Upload music"
              />
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {stats.music.slice(0, 5).map((music, index) => (
              <MusicCard
                key={music._id}
                music={music}
                list={stats.music}
                index={index}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function AdminHome() {
  const { pendingCounts } = useNotifications();
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api
      .get("/admin/stats")
      .then(({ data }) => setStats(data.stats))
      .catch(() => setStats(null));
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FaUsers}
          label="Users"
          value={stats?.totalUsers ?? "–"}
        />
        <StatCard
          icon={FaMusic}
          label="Songs"
          value={stats?.totalSongs ?? "–"}
          tone="fuchsia"
        />
        <StatCard
          icon={FaUserCheck}
          label="Pending artist requests"
          value={pendingCounts.artistRequests}
          tone="amber"
        />
        <StatCard
          icon={FaFlag}
          label="Open reports"
          value={pendingCounts.reports}
          tone="emerald"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <QuickLink
          to="/admin/artist-requests"
          icon={FaUserCheck}
          label="Review artist requests"
        />
        <QuickLink to="/admin/reports" icon={FaFlag} label="Review reports" />
        <QuickLink
          to="/admin/stats"
          icon={FaChartLine}
          label="Platform stats"
        />
      </div>
    </div>
  );
}

export const Dashboard = () => {
  const { user, activeRole } = useAuth();
  usePageTitle(
    activeRole === "artist"
      ? "Artist Studio"
      : activeRole === "admin"
        ? "Admin"
        : "Home",
  );

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <p className="text-sm text-gray-400">{greeting()},</p>
        <h1 className="flex flex-wrap items-center gap-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
          {activeRole === "artist"
            ? user?.artistProfile?.displayName || user?.username
            : user?.displayName || user?.username}
          {user?.isPremium && <PremiumBadge />}
        </h1>
        {activeRole !== "artist" && (
          <p className="mt-1 text-sm text-gray-400">
            {activeRole === "admin"
              ? "Here is what needs your attention."
              : "Here is your music."}
          </p>
        )}
      </div>
      {activeRole === "artist" ? (
        <ArtistHome />
      ) : activeRole === "admin" ? (
        <AdminHome />
      ) : (
        <ListenerHome user={user} />
      )}
    </div>
  );
};

export default Dashboard;
