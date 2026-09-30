import { useEffect, useState } from "react";
import { FaUsers, FaMusic, FaCompactDisc, FaUserPlus } from "react-icons/fa";

import api from "../services/api.js";

export const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/stats");

        setStats(response.data.stats);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        setError("Unable to load platform stats.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="px-8 py-10">
        <p className="text-gray-400">Loading stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-8 py-10">
        <div className="rounded-2xl border border-red-900 bg-red-950/30 p-8 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: FaUsers },
    { label: "Total Songs", value: stats.totalSongs, icon: FaMusic },
    { label: "Total Albums", value: stats.totalAlbums, icon: FaCompactDisc },
  ];

  return (
    <div className="px-8 py-10">
      <p className="text-sm font-medium text-amber-500">Overview</p>
      <h1 className="mt-1 text-3xl font-bold">Platform Stats</h1>

      {/* Summary Cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-gray-800 bg-gray-900 p-6"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Icon />
            </div>
            <p className="mt-4 text-3xl font-bold">{value}</p>
            <p className="mt-1 text-sm text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Role Breakdown */}
      <div className="mt-10">
        <h2 className="text-xl font-bold">Role Breakdown</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Object.entries(stats.roleCounts).map(([role, count]) => (
            <div
              key={role}
              className="rounded-2xl border border-gray-800 bg-gray-900 p-5"
            >
              <p className="text-2xl font-bold">{count}</p>
              <p className="mt-1 text-sm capitalize text-gray-400">{role}s</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Signups */}
      <div className="mt-10">
        <h2 className="text-xl font-bold">Recent Signups</h2>
        {stats.recentSignups.length === 0 ? (
          <p className="mt-4 text-gray-400">No signups yet.</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
            {stats.recentSignups.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-4 border-b border-gray-800 p-4 last:border-b-0"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                  <FaUserPlus className="text-sm" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{user.username}</h3>
                  <p className="truncate text-sm text-gray-500">{user.email}</p>
                </div>
                <span className="rounded-full bg-gray-800 px-3 py-1 text-xs font-semibold capitalize text-gray-300">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
