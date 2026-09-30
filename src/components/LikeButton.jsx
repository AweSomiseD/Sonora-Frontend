import { useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext";

export const LikeButton = ({ musicId }) => {
  const { user, fetchCurrentUser, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [localLiked, setLocalLiked] = useState(null);

  const serverLiked = user?.likedMusics?.some((id) => id?.toString() === musicId?.toString()) || false;
  const liked = localLiked === null ? serverLiked : localLiked;

  useEffect(() => setLocalLiked(null), [serverLiked, musicId]);

  const handleClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const response = await api.post(`/music/${musicId}/like`);
      const nextLiked = response.data.liked;
      setLocalLiked(nextLiked);
      const ids = (user?.likedMusics || []).map((id) => id.toString());
      updateUser({
        likedMusics: nextLiked
          ? [...ids, musicId]
          : ids.filter((id) => id !== musicId),
      });
      await fetchCurrentUser(true);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
        liked
          ? "text-red-500 hover:bg-red-500/10"
          : "text-gray-500 hover:bg-gray-800 hover:text-red-400"
      }`}
    >
      {liked ? (
        <FaHeart className="text-sm" />
      ) : (
        <FaRegHeart className="text-sm" />
      )}
    </button>
  );
};
