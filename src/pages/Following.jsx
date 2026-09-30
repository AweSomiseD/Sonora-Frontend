import { useEffect, useState } from "react";
import { FaUser, FaUserCheck } from "react-icons/fa";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext";

export const Following = () => {
  const { fetchCurrentUser } = useAuth();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState(null);

  const fetchFollowed = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/music/followed-artists");

      setArtists(response.data.artists || []);
    } catch (error) {
      console.error("Failed to fetch followed artists:", error);
      setError("Unable to load followed artists.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowed();
  }, []);

  const handleUnfollow = async (artistId) => {
    setPendingId(artistId);

    try {
      await api.post(`/music/artists/${artistId}/follow`);
      setArtists((prev) => prev.filter((a) => a._id !== artistId));
      await fetchCurrentUser(true);
    } catch (error) {
      console.error("Failed to unfollow:", error);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="px-8 py-10">
      <p className="text-sm font-medium text-amber-500">Your Artists</p>
      <h1 className="mt-1 text-3xl font-bold">Following</h1>

      {loading ? (
        <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      ) : error ? (
        <div className="mt-8 rounded-2xl border border-red-900 bg-red-950/30 p-8 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      ) : artists.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-700 bg-gray-900 p-10 text-center">
          <FaUser className="mx-auto text-4xl text-gray-700" />
          <h3 className="mt-4 text-xl font-bold">Not following anyone yet</h3>
          <p className="mt-2 text-gray-400">
            Artists you follow will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {artists.map((artist) => (
            <div
              key={artist._id}
              className="rounded-2xl border border-gray-800 bg-gray-900 p-5 text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-xl font-bold text-amber-500">
                {artist.username?.[0]?.toUpperCase() || "A"}
              </div>

              <h3 className="mt-3 truncate font-semibold">{artist.username}</h3>

              <button
                onClick={() => handleUnfollow(artist._id)}
                disabled={pendingId === artist._id}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-gray-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
              >
                <FaUserCheck className="text-xs" />
                Following
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
