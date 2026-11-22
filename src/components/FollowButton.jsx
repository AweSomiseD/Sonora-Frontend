import { useState } from "react";
import { FaUserCheck, FaUserPlus } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext.jsx";
import api, { getErrorMessage } from "../services/api.js";

export const FollowButton = ({ artistId, onChange }) => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const followed = (user?.followedArtists || []).map((id) => String(id?._id || id));
  const following = followed.includes(String(artistId));

  if (!artistId || String(user?._id || user?.id) === String(artistId)) return null;

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/music/artists/${artistId}/follow`);
      updateUser({
        followedArtists: data.following ? [...new Set([...followed, String(artistId)])] : followed.filter((id) => id !== String(artistId)),
      });
      onChange?.(data.following);
    } catch (error) {
      showToast(getErrorMessage(error, "Could not update follow status"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-pressed={following}
      className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-semibold transition disabled:opacity-50 ${
        following
          ? "border border-violet-500/30 bg-violet-500/10 text-violet-100 hover:bg-violet-500/20"
          : "bg-linear-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:brightness-110"
      }`}
    >
      {following ? <FaUserCheck aria-hidden="true" /> : <FaUserPlus aria-hidden="true" />}
      {following ? "Following" : "Follow"}
    </button>
  );
};

export default FollowButton;
