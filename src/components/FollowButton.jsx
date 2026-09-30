import { useEffect, useState } from "react";
import { FaUserPlus, FaUserCheck } from "react-icons/fa";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext";

export const FollowButton = ({ artistId }) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const followedArtists = user?.followedArtists || [];
    setFollowing(
      followedArtists.some(
        (id) => (id?._id || id)?.toString() === artistId?.toString(),
      ),
    );
  }, [artistId, user?.followedArtists]);

  if (
    !artistId ||
    (user?._id || user?.id)?.toString() === artistId?.toString()
  ) {
    return null;
  }

  const handleClick = async () => {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await api.post(`/music/artists/${artistId}/follow`);
      const nextFollowing = response.data.following;
      setFollowing(nextFollowing);

      const followedArtists = user?.followedArtists || [];
      const nextFollowedArtists = nextFollowing
        ? [...followedArtists, artistId]
        : followedArtists.filter(
            (id) => (id?._id || id)?.toString() !== artistId.toString(),
          );
      updateUser({ followedArtists: nextFollowedArtists });
    } catch (error) {
      console.error("Failed to toggle follow:", error);
      setError(error.response?.data?.message || "Unable to update follow status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
          following
            ? "bg-gray-800 text-white hover:bg-gray-700"
            : "bg-amber-500 text-gray-950 hover:bg-amber-400"
        }`}
      >
        {following ? <FaUserCheck /> : <FaUserPlus />}
        {following ? "Following" : "Follow"}
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </>
  );
};
