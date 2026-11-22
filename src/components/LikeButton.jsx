import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext.jsx";
import api, { getErrorMessage } from "../services/api.js";

// Optimistic like / unlike
export const LikeButton = ({ musicId, size = "md" }) => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const likedIds = (user?.likedMusics || []).map(String);
  const liked = likedIds.includes(String(musicId));

  const toggle = async (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (loading || !musicId) return;

    setLoading(true);
    const optimistic = liked ? likedIds.filter((id) => id !== String(musicId)) : [...likedIds, String(musicId)];
    updateUser({ likedMusics: optimistic });
    try {
      const { data } = await api.post(`/music/${musicId}/like`);
      updateUser({ likedMusics: data.liked ? [...new Set([...likedIds, String(musicId)])] : likedIds.filter((id) => id !== String(musicId)) });
    } catch (error) {
      updateUser({ likedMusics: likedIds }); // undo
      showToast(getErrorMessage(error, "Could not update your likes"), "error");
    } finally {
      setLoading(false);
    }
  };

  const dimension = size === "sm" ? "h-8 w-8" : "h-10 w-10";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-pressed={liked}
      aria-label={liked ? "Remove from liked songs" : "Add to liked songs"}
      className={`flex ${dimension} shrink-0 cursor-pointer items-center justify-center rounded-full transition disabled:opacity-60 ${
        liked ? "text-fuchsia-400 hover:bg-fuchsia-500/10" : "text-gray-500 hover:bg-white/5 hover:text-fuchsia-300"
      }`}
    >
      {liked ? <FaHeart className="text-sm" aria-hidden="true" style={{ animation: "heartBeat 0.4s ease" }} /> : <FaRegHeart className="text-sm" aria-hidden="true" />}
    </button>
  );
};

export default LikeButton;
