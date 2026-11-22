import { Link } from "react-router-dom";
import { FaBan, FaClock, FaMusic } from "react-icons/fa";
import AppBackground from "./AppBackground.jsx";

const VARIANTS = {
  banned: { icon: FaBan, tone: "text-red-400", title: "Your account has been banned" },
  expired: { icon: FaClock, tone: "text-amber-300", title: "Your session has expired" },
  loading: { icon: FaMusic, tone: "text-violet-300", title: "Loading Sonora..." },
};

// Full-page messages: banned, session expired, app loading
export default function StatusScreen({ variant = "loading", reason, onLogout }) {
  const { icon: Icon, tone, title } = VARIANTS[variant];
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-950 px-4 text-white">
      <AppBackground />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-violet-500/20 bg-gray-900/70 p-8 text-center backdrop-blur-xl" role={variant === "loading" ? "status" : "alert"}>
        <Icon className={`mx-auto mb-4 text-4xl ${tone} ${variant === "loading" ? "animate-pulse" : ""}`} aria-hidden="true" />
        <h1 className="text-xl font-bold">{title}</h1>
        {variant === "banned" && (
          <>
            <p className="mt-3 text-sm text-gray-300">{reason ? `Reason: ${reason}` : "Please contact support if you think this is a mistake."}</p>
            <button type="button" onClick={onLogout} className="mt-6 min-h-10 cursor-pointer rounded-xl border border-violet-500/30 px-5 text-sm font-semibold text-violet-200 hover:bg-violet-500/10">
              Back to home
            </button>
          </>
        )}
        {variant === "expired" && (
          <Link to="/login" className="mt-6 inline-flex min-h-10 items-center rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-semibold">
            Log in again
          </Link>
        )}
      </div>
    </div>
  );
}
