import { Link } from "react-router-dom";
import AppBackground from "./AppBackground.jsx";

// Centered dark card used by the small auth pages (verify, forgot, reset, Google finish)
export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-950 px-4 py-24 text-white">
      <AppBackground />
      <div className="animate-fade-in-up relative z-10 w-full max-w-md rounded-2xl border border-violet-500/20 bg-gray-900/70 p-7 shadow-[0_0_60px_rgba(139,92,246,0.15)] backdrop-blur-xl sm:p-8">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2 text-lg font-black">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-fuchsia-500 text-sm">S</span>
          Sonora
        </Link>
        <h1 className="text-center text-2xl font-bold">{title}</h1>
        {subtitle && <p className="mt-2 text-center text-sm text-gray-400">{subtitle}</p>}
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-gray-400">{footer}</div>}
      </div>
    </div>
  );
}
