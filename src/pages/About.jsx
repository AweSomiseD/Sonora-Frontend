import { NavLink } from "react-router-dom";
import {
  FaMusic,
  FaCompactDisc,
  FaUpload,
  FaUsers,
  FaPlay,
  FaArrowRight,
  FaHeadphones,
  FaMicrophone,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import { getDashboardPath } from "../routes/routePaths.js";

export const About = () => {
  usePageTitle("About");
  const { user, activeRole, roles } = useAuth();
  // Links depend on who is looking (visitor, listener, artist)
  const startPath = user ? getDashboardPath(activeRole) : "/register";
  const albumsPath = user ? (activeRole === "listener" ? "/listener/album" : getDashboardPath(activeRole)) : "/register";
  const uploadPath = !user ? "/register" : roles.includes("artist") ? "/artist/upload-music" : "/listener/become-artist";

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


      {/* ========================================
          Hero Section
      ======================================== */}

      <section className="relative z-10 overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid min-h-105 items-center gap-10 py-16 lg:grid-cols-2">
            {/* Content */}

            <div className="animate-fade-in-left">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/5 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.25em] text-violet-400 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
                </span>
                About Sonora
              </p>

              <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl">
                <span className="bg-linear-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Music made for
                </span>
                <br />
                <span
                  className="bg-linear-to-r from-violet-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent"
                  style={{
                    backgroundSize: "200% auto",
                    animation: "gradientShift 4s ease infinite",
                  }}
                >
                  everyone.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
                Sonora is a music platform built for listeners and artists.
                Discover music, explore albums, listen to your favorite tracks,
                and give artists a place to share their work with the world.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <NavLink
                  to={startPath}
                  className="group relative flex items-center gap-3 overflow-hidden rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 px-7 py-3.5 font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.6)]"
                >
                  <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <FaPlay className="relative text-sm transition-transform duration-300 group-hover:scale-110" />
                  <span className="relative">Start Listening</span>
                </NavLink>

                <NavLink
                  to={albumsPath}
                  className="group flex items-center gap-3 rounded-full border border-gray-700/50 bg-gray-900/50 px-7 py-3.5 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-violet-500/50 hover:bg-violet-500/5 hover:text-violet-300"
                >
                  Explore Albums
                  <FaArrowRight className="text-sm transition-transform duration-300 group-hover:translate-x-1" />
                </NavLink>
              </div>
            </div>

            {/* Visual */}

            <div className="hidden justify-center lg:flex">
              <div className="relative animate-fade-in-right flex h-80 w-80 items-center justify-center">
                {/* Pulsing ripples */}
                <div
                  className="absolute inset-0 rounded-full border border-violet-500/20"
                  style={{ animation: "ripple 3s ease-out infinite" }}
                />
                <div
                  className="absolute inset-0 rounded-full border border-fuchsia-500/15"
                  style={{
                    animation: "ripple 3s ease-out infinite",
                    animationDelay: "1s",
                  }}
                />

                {/* Outer glow */}
                <div className="absolute inset-0 rounded-full bg-linear-to-br from-violet-500/20 via-fuchsia-500/10 to-transparent blur-3xl" />

                {/* Main disc */}
                <div className="relative flex h-64 w-64 items-center justify-center rounded-full border border-violet-500/30 bg-gray-900 shadow-2xl">
                  {/* Rotating inner ring */}
                  <div
                    className="absolute h-52 w-52 rounded-full border border-violet-500/20"
                    style={{ animation: "spinSlow 20s linear infinite" }}
                  >
                    <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.9)]" />
                  </div>

                  {/* Center icon */}
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 text-white shadow-[0_0_40px_rgba(139,92,246,0.6)]">
                    <FaMusic className="text-5xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          What Is Sonora
      ======================================== */}

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-medium text-violet-400">Our Platform</p>

            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              A place where music and artists meet.
            </h2>

            <p className="mt-5 leading-8 text-gray-400">
              Sonora is designed to make music simple to discover and easy to
              share. Listeners can explore songs and albums while artists can
              upload their own music and organize their tracks into albums.
            </p>

            <p className="mt-4 leading-8 text-gray-400">
              Whether you are here to discover your next favorite song or share
              music you have created, Sonora gives you the tools to enjoy and
              manage your music in one place.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Listener card */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-[0_20px_60px_-15px_rgba(139,92,246,0.4)]">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/15 blur-3xl transition-all duration-500 group-hover:bg-violet-500/30" />
              <div className="relative">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-violet-500/25 to-fuchsia-500/10 text-violet-400 transition-all duration-500 group-hover:scale-110 group-hover:text-violet-300 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                  <FaHeadphones className="text-xl" />
                </div>

                <h3 className="text-lg font-bold transition-colors duration-300 group-hover:text-violet-300">
                  For Listeners
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Discover music, explore albums and enjoy tracks from different
                  artists.
                </p>
              </div>
            </div>

            {/* Artist card */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-fuchsia-500/30 hover:shadow-[0_20px_60px_-15px_rgba(217,70,239,0.4)]">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-fuchsia-500/15 blur-3xl transition-all duration-500 group-hover:bg-fuchsia-500/30" />
              <div className="relative">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-fuchsia-500/25 to-violet-500/10 text-fuchsia-400 transition-all duration-500 group-hover:scale-110 group-hover:text-fuchsia-300 group-hover:shadow-[0_0_30px_rgba(217,70,239,0.5)]">
                  <FaMicrophone className="text-xl" />
                </div>

                <h3 className="text-lg font-bold transition-colors duration-300 group-hover:text-fuchsia-300">
                  For Artists
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Upload your music, create albums and manage your releases from
                  your artist dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          Features
      ======================================== */}

      <section className="relative z-10 border-y border-gray-800/50 bg-gray-900/30 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-violet-400">
              What You Can Do
            </p>

            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              Everything you need for your music.
            </h2>

            <p className="mt-4 text-gray-400">
              Sonora brings music discovery and artist management together in
              one simple platform.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {/* Feature 1 */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-violet-500/30 hover:shadow-[0_20px_60px_-15px_rgba(139,92,246,0.4)]">
              <div className="absolute inset-0 bg-linear-to-br from-violet-500/8 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-violet-500/25 to-fuchsia-500/10 text-violet-400 transition-all duration-500 group-hover:scale-110 group-hover:bg-violet-500 group-hover:text-white group-hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]">
                  <FaMusic />
                </div>

                <h3 className="mt-5 text-lg font-bold transition-colors duration-300 group-hover:text-violet-300">
                  Discover Music
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Browse and listen to music uploaded by artists on the
                  platform.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-fuchsia-500/30 hover:shadow-[0_20px_60px_-15px_rgba(217,70,239,0.4)]">
              <div className="absolute inset-0 bg-linear-to-br from-fuchsia-500/8 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-fuchsia-500/25 to-violet-500/10 text-fuchsia-400 transition-all duration-500 group-hover:scale-110 group-hover:bg-fuchsia-500 group-hover:text-white group-hover:shadow-[0_0_30px_rgba(217,70,239,0.6)]">
                  <FaCompactDisc />
                </div>

                <h3 className="mt-5 text-lg font-bold transition-colors duration-300 group-hover:text-fuchsia-300">
                  Explore Albums
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Explore albums and discover multiple tracks from your favorite
                  artists.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-purple-500/30 hover:shadow-[0_20px_60px_-15px_rgba(168,85,247,0.4)]">
              <div className="absolute inset-0 bg-linear-to-br from-purple-500/8 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-purple-500/25 to-violet-500/10 text-purple-400 transition-all duration-500 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white group-hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]">
                  <FaUpload />
                </div>

                <h3 className="mt-5 text-lg font-bold transition-colors duration-300 group-hover:text-purple-300">
                  Upload Music
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Artists can upload their tracks and make their music available
                  to listeners.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-violet-400/30 hover:shadow-[0_20px_60px_-15px_rgba(139,92,246,0.4)]">
              <div className="absolute inset-0 bg-linear-to-br from-violet-400/8 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-violet-400/25 to-fuchsia-400/10 text-violet-300 transition-all duration-500 group-hover:scale-110 group-hover:bg-violet-400 group-hover:text-white group-hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]">
                  <FaUsers />
                </div>

                <h3 className="mt-5 text-lg font-bold transition-colors duration-300 group-hover:text-violet-300">
                  Built for Everyone
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  A simple experience designed for both music listeners and
                  independent artists.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          Artist Section
      ======================================== */}

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="group relative overflow-hidden rounded-3xl p-0.5">
          {/* Animated gradient border */}
          <div
            className="absolute inset-0 rounded-3xl bg-linear-to-r from-violet-500 via-fuchsia-500 to-purple-500"
            style={{
              backgroundSize: "200% 200%",
              animation: "gradientShift 5s ease infinite",
            }}
          />

          <div className="relative overflow-hidden rounded-[calc(1.5rem-2px)] bg-linear-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-8 sm:p-12">
            {/* Decorative circles */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full border border-white/10" />
            <div className="absolute right-10 top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

            <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-100">
                  For Artists
                </p>

                <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                  Your music deserves to be heard.
                </h2>

                <p className="mt-4 max-w-xl leading-7 text-violet-100/90">
                  Apply from your listener account. Once an admin approves you,
                  upload tracks, organize albums and follow your plays in
                  Artist Studio.
                </p>

                <NavLink
                  to={uploadPath}
                  className="group/btn relative mt-7 inline-flex items-center gap-3 overflow-hidden rounded-full bg-gray-950 px-7 py-3.5 font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.7)]"
                >
                  <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-violet-500/40 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                  <span className="relative">Start Uploading</span>
                  <FaArrowRight className="relative transition-transform duration-300 group-hover/btn:translate-x-1" />
                </NavLink>
              </div>

              <div className="hidden justify-center md:flex">
                <div className="relative flex h-52 w-52 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                  {/* Rotating ring */}
                  <div
                    className="absolute inset-0 rounded-full border border-white/20"
                    style={{ animation: "spinSlow 24s linear infinite" }}
                  >
                    <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
                  </div>
                  <FaMicrophone className="text-7xl text-white/90" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          Simple Stats
      ======================================== */}

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {/* Stat 1 */}
          <div className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-7 text-center backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-[0_20px_60px_-15px_rgba(139,92,246,0.4)]">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/15 blur-3xl transition-all duration-500 group-hover:bg-violet-500/30" />
            <div className="relative">
              <FaMusic className="mx-auto text-2xl text-violet-400 transition-all duration-300 group-hover:scale-110 group-hover:text-violet-300" />
              <h3 className="mt-4 text-2xl font-black transition-colors duration-300 group-hover:text-violet-300">
                Music
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Discover tracks from artists on the platform.
              </p>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-7 text-center backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-fuchsia-500/30 hover:shadow-[0_20px_60px_-15px_rgba(217,70,239,0.4)]">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-fuchsia-500/15 blur-3xl transition-all duration-500 group-hover:bg-fuchsia-500/30" />
            <div className="relative">
              <FaCompactDisc className="mx-auto text-2xl text-fuchsia-400 transition-all duration-300 group-hover:scale-110 group-hover:text-fuchsia-300" />
              <h3 className="mt-4 text-2xl font-black transition-colors duration-300 group-hover:text-fuchsia-300">
                Albums
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Explore collections of songs organized by artists.
              </p>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-7 text-center backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-purple-500/30 hover:shadow-[0_20px_60px_-15px_rgba(168,85,247,0.4)]">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-500/15 blur-3xl transition-all duration-500 group-hover:bg-purple-500/30" />
            <div className="relative">
              <FaUsers className="mx-auto text-2xl text-purple-400 transition-all duration-300 group-hover:scale-110 group-hover:text-purple-300" />
              <h3 className="mt-4 text-2xl font-black transition-colors duration-300 group-hover:text-purple-300">
                Community
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Connect listeners and artists through music.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          Final CTA
      ======================================== */}

      <section className="relative z-10 border-t border-gray-800/50">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-violet-400">
            Ready to listen?
          </p>

          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            Find your next favorite song.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-gray-400">
            Explore music, discover new artists and enjoy your listening
            experience with Sonora.
          </p>

          <NavLink
            to="/"
            className="group relative mt-7 inline-flex items-center gap-3 overflow-hidden rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 px-7 py-3.5 font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.6)]"
          >
            <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <FaPlay className="relative text-sm transition-transform duration-300 group-hover:scale-110" />
            <span className="relative">Start Listening</span>
          </NavLink>
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
