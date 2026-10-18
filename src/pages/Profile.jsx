import { FaUser, FaEnvelope, FaIdBadge } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.03); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 animate-pulse rounded-full bg-violet-500/10 blur-[120px]" />
        <div
          className="absolute -right-40 bottom-20 h-96 w-96 animate-pulse rounded-full bg-fuchsia-600/8 blur-[120px]"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      <div className="relative z-10 px-8 py-10 animate-fade-in-up">
        {/* Header */}
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
            </span>
            <FaIdBadge className="text-[10px]" />
            Your Account
          </p>

          <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            <span className="bg-linear-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Profile
            </span>
          </h1>
        </div>

        {/* Profile Card */}
        <div className="relative mt-8 max-w-lg overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-6 backdrop-blur-sm">
          {/* Corner glow orb */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/15 blur-3xl" />

          {/* Avatar + Name */}
          <div className="relative flex items-center gap-4 border-b border-gray-800/50 pb-5">
            {/* Avatar with gradient ring + glow */}
            <div className="relative h-16 w-16 shrink-0">
              <div className="absolute inset-0 rounded-full bg-linear-to-br from-violet-500/50 to-fuchsia-500/40 blur-md" />
              <div
                className="relative flex h-16 w-16 items-center justify-center rounded-full border border-violet-500/40 bg-linear-to-br from-violet-500/30 to-fuchsia-500/20 text-2xl font-black text-violet-200 shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                style={{ animation: "floatSlow 5s ease-in-out infinite" }}
              >
                {user?.username?.[0]?.toUpperCase() || "U"}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-xl font-bold">
                <span className="bg-linear-to-r from-white via-violet-100 to-fuchsia-100 bg-clip-text text-transparent">
                  {user?.username}
                </span>
              </h2>
              <p className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold capitalize text-violet-300">
                <FaIdBadge className="text-[9px]" />
                {user?.role}
              </p>
            </div>
          </div>

          {/* Info rows */}
          <div className="relative mt-5 space-y-3">
            {/* Username row */}
            <div className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-all duration-300 hover:border-violet-500/20 hover:bg-violet-500/5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-violet-500/20 to-fuchsia-500/10 text-violet-400 transition-all duration-300 group-hover:scale-105 group-hover:text-violet-300">
                <FaUser className="text-sm" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500">
                  Username
                </p>
                <p className="truncate text-sm font-medium text-gray-200 transition-colors duration-300 group-hover:text-white">
                  {user?.username}
                </p>
              </div>
            </div>

            {/* Email row */}
            <div className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-all duration-300 hover:border-violet-500/20 hover:bg-violet-500/5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-violet-500/20 to-fuchsia-500/10 text-violet-400 transition-all duration-300 group-hover:scale-105 group-hover:text-violet-300">
                <FaEnvelope className="text-sm" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500">
                  Email
                </p>
                <p className="truncate text-sm font-medium text-gray-200 transition-colors duration-300 group-hover:text-white">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Role row */}
            <div className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-all duration-300 hover:border-violet-500/20 hover:bg-violet-500/5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-violet-500/20 to-fuchsia-500/10 text-violet-400 transition-all duration-300 group-hover:scale-105 group-hover:text-violet-300">
                <FaIdBadge className="text-sm" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500">
                  Role
                </p>
                <p className="truncate text-sm font-medium capitalize text-gray-200 transition-colors duration-300 group-hover:text-white">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
