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
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ========================================
          Hero Section
      ======================================== */}

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-amber-500/20 via-gray-950 to-gray-950" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid min-h-130 items-center gap-10 py-16 lg:grid-cols-2">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-amber-500">
                Welcome to Spookeify
              </p>

              <h1 className="max-w-2xl text-5xl font-black leading-tight sm:text-6xl">
                Your music.
                <br />
                Your mood.
                <br />
                <span className="text-amber-500">Your world.</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-gray-400">
                Discover new music, listen to your favorite artists and share
                your own tracks with the world.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <NavLink
                  to="/register"
                  className="flex items-center gap-3 rounded-full bg-amber-500 px-7 py-3.5 font-bold text-gray-950 transition hover:bg-amber-400"
                >
                  <FaPlay className="text-sm" />
                  Get Started
                </NavLink>

                <NavLink
                  to="/about"
                  className="flex items-center gap-3 rounded-full border border-gray-700 px-7 py-3.5 font-semibold text-white transition hover:border-amber-500 hover:text-amber-500"
                >
                  Learn More
                  <FaArrowRight className="text-sm" />
                </NavLink>
              </div>
            </div>

            <div className="hidden justify-center lg:flex">
              <div className="relative">
                <div className="absolute -inset-8 rounded-full bg-amber-500/10 blur-3xl" />

                <img
                  src="/src/assets/hero.png"
                  alt="Music"
                  className="relative h-95 w-95 object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          Highlights
      ======================================== */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <FaMusic className="text-xl" />
            </div>

            <h3 className="text-lg font-bold">Discover Music</h3>

            <p className="mt-2 text-sm text-gray-400">
              Browse and listen to tracks uploaded by artists on the platform.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <FaCompactDisc className="text-xl" />
            </div>

            <h3 className="text-lg font-bold">Explore Albums</h3>

            <p className="mt-2 text-sm text-gray-400">
              Dive into full albums from your favorite independent artists.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <FaMicrophone className="text-xl" />
            </div>

            <h3 className="text-lg font-bold">Share Your Music</h3>

            <p className="mt-2 text-sm text-gray-400">
              Artists can upload tracks, build albums and reach listeners.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================
          CTA
      ======================================== */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-linear-to-r from-amber-500 to-orange-600 p-8 text-gray-950 sm:p-12">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-black sm:text-4xl">
                Ready to jump in?
              </h2>

              <p className="mt-3 max-w-xl text-gray-900/80">
                Create your free account and start listening — or start sharing
                your own music today.
              </p>
            </div>

            <NavLink
              to="/register"
              className="flex shrink-0 items-center gap-3 rounded-full bg-gray-950 px-7 py-3.5 font-bold text-white transition hover:bg-gray-800"
            >
              Get Started
              <FaArrowRight />
            </NavLink>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-800 px-4 py-8 text-center text-sm text-gray-500">
        <p>© 2026 Spookeify. Your music, your way.</p>
      </footer>
    </div>
  );
};
