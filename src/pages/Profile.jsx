import { FaUser, FaEnvelope, FaIdBadge } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="px-8 py-10">
      <p className="text-sm font-medium text-amber-500">Your Account</p>
      <h1 className="mt-1 text-3xl font-bold">Profile</h1>

      <div className="mt-8 max-w-lg rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <div className="flex items-center gap-4 border-b border-gray-800 pb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-xl font-bold text-amber-500">
            {user?.username?.[0]?.toUpperCase() || "U"}
          </div>

          <div>
            <h2 className="text-lg font-bold">{user?.username}</h2>
            <p className="text-sm text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <FaUser className="text-gray-500" />
            {user?.username}
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-300">
            <FaEnvelope className="text-gray-500" />
            {user?.email}
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-300">
            <FaIdBadge className="text-gray-500" />
            <span className="capitalize">{user?.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
