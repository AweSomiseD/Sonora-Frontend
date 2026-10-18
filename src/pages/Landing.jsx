import { NavLink } from "react-router-dom";
import {
  FaPlay,
  FaMusic,
  FaCompactDisc,
  FaArrowRight,
  FaMicrophone,
} from "react-icons/fa";

export const Landing = () => {
  console.log("🔥 LANDING RENDERED");

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950 text-white">
      {/* ========================================
          Animated Background Textures
      ======================================== */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute -left-40 -top-40 h-96 w-96 animate-pulse rounded-full bg-violet-500/15 blur-[120px]" />
        <div
          className="absolute -right-40 top-1/3 h-96 w-96 animate-pulse rounded-full bg-fuchsia-600/12 blur-[120px]"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute -bottom-40 left-1/3 h-96 w-96 animate-pulse rounded-full bg-purple-400/12 blur-[120px]"
          style={{ animationDelay: "2s" }}
        />

        {/* Animated grid texture */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139,92,246,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.6) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            animation: "gridMove 20s linear infinite",
          }}
        />

        {/* Floating music notes */}
        <div className="absolute left-[10%] top-[20%] animate-[float_8s_ease-in-out_infinite] text-violet-500/15">
          <FaMusic className="h-8 w-8" />
        </div>
        <div
          className="absolute right-[15%] top-[60%] animate-[float_10s_ease-in-out_infinite] text-fuchsia-500/15"
          style={{ animationDelay: "1s" }}
        >
          <FaCompactDisc className="h-10 w-10" />
        </div>
        <div
          className="absolute left-[20%] top-[80%] animate-[float_9s_ease-in-out_infinite] text-purple-500/15"
          style={{ animationDelay: "2s" }}
        >
          <FaMicrophone className="h-7 w-7" />
        </div>

        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Custom keyframes */}
      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(10deg); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes orbitalPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .animate-fade-in-left {
          animation: fadeInLeft 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .animate-fade-in-right {
          animation: fadeInRight 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      {/* ========================================
          Hero Section
      ======================================== */}
      <section className="relative z-10 overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid min-h-150 items-center gap-12 py-20 lg:grid-cols-2">
            <div className="animate-fade-in-left">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/5 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.25em] text-violet-400 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
                </span>
                Welcome to Sonora
              </p>

              <h1 className="max-w-2xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                <span className="block bg-linear-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Your music.
                </span>
                <span className="block bg-linear-to-r from-gray-200 via-white to-gray-300 bg-clip-text text-transparent">
                  Your mood.
                </span>
                <span
                  className="block bg-linear-to-r from-violet-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent"
                  style={{
                    backgroundSize: "200% auto",
                    animation: "gradientShift 4s ease infinite",
                  }}
                >
                  Your world.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-gray-400">
                Discover new music, listen to your favorite artists and share
                your own tracks with the world.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <NavLink
                  to="/register"
                  className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 px-8 py-4 font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.6)]"
                >
                  <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <FaPlay className="relative text-sm transition-transform duration-300 group-hover:scale-110" />
                  <span className="relative">Get Started</span>
                </NavLink>

                <NavLink
                  to="/about"
                  className="group flex items-center gap-3 rounded-full border border-gray-700/50 bg-gray-900/50 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-violet-500/50 hover:bg-violet-500/5 hover:text-violet-300"
                >
                  Learn More
                  <FaArrowRight className="text-sm transition-transform duration-300 group-hover:translate-x-1" />
                </NavLink>
              </div>
            </div>

            <div className="hidden justify-center lg:flex">
              <div className="relative animate-fade-in-right">
                {/* Outer rotating ring */}
                <div
                  className="absolute -inset-12 rounded-full border border-violet-500/20"
                  style={{ animation: "spinSlow 24s linear infinite" }}
                >
                  <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.9)]" />
                </div>

                {/* Inner rotating ring (reverse) */}
                <div
                  className="absolute -inset-20 rounded-full border border-fuchsia-500/15"
                  style={{
                    animation: "spinSlow 32s linear infinite reverse",
                  }}
                >
                  <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.9)]" />
                </div>

                {/* Glow behind image */}
                <div className="absolute -inset-8 rounded-full bg-linear-to-br from-violet-500/25 via-fuchsia-500/15 to-transparent blur-3xl" />

                {/* Main image with float animation */}
                <div
                  className="relative"
                  style={{ animation: "floatSlow 6s ease-in-out infinite" }}
                >
                  <img
                    src="/src/assets/hero.png"
                    alt="Music"
                    className="relative h-9580px] object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
    Highlights
======================================== */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1 */}
          <div className="group relative overflow-hidden rounded-3xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-violet-500/30 hover:shadow-[0_20px_60px_-15px_rgba(139,92,246,0.4)]">
            <div className="absolute inset-0 bg-linear-to-br from-violet-500/20 via-violet-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/25 blur-3xl transition-all duration-500 group-hover:bg-violet-500/45" />

            <div className="relative">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500/25 to-fuchsia-500/10 text-violet-400 transition-all duration-500 group-hover:scale-110 group-hover:text-violet-300 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                <FaMusic className="text-2xl" />
              </div>

              <h3 className="text-xl font-bold transition-colors duration-300 group-hover:text-violet-300">
                Discover Music
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Browse and listen to tracks uploaded by artists on the platform.
              </p>

              <div className="mt-5 h-1 w-12 rounded-full bg-linear-to-r from-violet-500 to-transparent transition-all duration-500 group-hover:w-20" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="group relative overflow-hidden rounded-3xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-fuchsia-500/30 hover:shadow-[0_20px_60px_-15px_rgba(217,70,239,0.4)]">
            <div className="absolute inset-0 bg-linear-to-br from-fuchsia-500/20 via-fuchsia-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-fuchsia-500/25 blur-3xl transition-all duration-500 group-hover:bg-fuchsia-500/45" />

            <div className="relative">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-fuchsia-500/25 to-violet-500/10 text-fuchsia-400 transition-all duration-500 group-hover:scale-110 group-hover:text-fuchsia-300 group-hover:shadow-[0_0_30px_rgba(217,70,239,0.5)]">
                <FaCompactDisc className="text-2xl" />
              </div>

              <h3 className="text-xl font-bold transition-colors duration-300 group-hover:text-fuchsia-300">
                Explore Albums
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Dive into full albums from your favorite independent artists.
              </p>

              <div className="mt-5 h-1 w-12 rounded-full bg-linear-to-r from-fuchsia-500 to-transparent transition-all duration-500 group-hover:w-20" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="group relative overflow-hidden rounded-3xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-purple-500/30 hover:shadow-[0_20px_60px_-15px_rgba(168,85,247,0.4)]">
            <div className="absolute inset-0 bg-linear-to-br from-purple-500/20 via-purple-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-500/25 blur-3xl transition-all duration-500 group-hover:bg-purple-500/45" />

            <div className="relative">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-purple-500/25 to-violet-500/10 text-purple-400 transition-all duration-500 group-hover:scale-110 group-hover:text-purple-300 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                <FaMicrophone className="text-2xl" />
              </div>

              <h3 className="text-xl font-bold transition-colors duration-300 group-hover:text-purple-300">
                Share Your Music
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Artists can upload tracks, build albums and reach listeners.
              </p>

              <div className="mt-5 h-1 w-12 rounded-full bg-linear-to-r from-purple-500 to-transparent transition-all duration-500 group-hover:w-20" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          CTA
      ======================================== */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="group relative overflow-hidden rounded-4xl p-0.5">
          {/* Animated gradient border */}
          <div
            className="absolute inset-0 rounded-4xl bg-linear-to-r from-violet-500 via-fuchsia-500 to-purple-500"
            style={{
              backgroundSize: "200% 200%",
              animation: "gradientShift 5s ease infinite",
            }}
          />

          <div className="relative overflow-hidden rounded-[calc(2rem-2px)] bg-linear-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-10 sm:p-14">
            {/* Decorative circles */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full border border-white/10" />
            <div className="absolute right-10 top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-fuchsia-400/20 blur-3xl" />

            <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
              <div>
                <h2 className="text-3xl font-black text-white sm:text-4xl lg:text-5xl">
                  Ready to jump in?
                </h2>

                <p className="mt-4 max-w-xl text-violet-100/90">
                  Create your free account and start listening — or start
                  sharing your own music today.
                </p>
              </div>

              <NavLink
                to="/register"
                className="group/btn relative flex shrink-0 items-center gap-3 overflow-hidden rounded-full bg-gray-950 px-8 py-4 font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.7)]"
              >
                <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-violet-500/40 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                <span className="relative">Get Started</span>
                <FaArrowRight className="relative transition-transform duration-300 group-hover/btn:translate-x-1" />
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          Footer
      ======================================== */}
      <footer className="relative z-10 border-t border-gray-800/50 px-4 py-8 text-center text-sm text-gray-500">
        <p>© 2026 Sonora. Your music, your way.</p>
      </footer>
    </div>
  );
};
