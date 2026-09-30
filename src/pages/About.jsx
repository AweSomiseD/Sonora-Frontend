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

export const About = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ========================================
          Hero Section
      ======================================== */}

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-amber-500/15 via-gray-950 to-gray-950" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid min-h-105 items-center gap-10 py-16 lg:grid-cols-2">
            {/* Content */}

            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-amber-500">
                About Spookeify
              </p>

              <h1 className="max-w-3xl text-5xl font-black leading-tight sm:text-6xl">
                Music made for
                <br />
                <span className="text-amber-500">everyone.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
                Spookeify is a music platform built for listeners and artists.
                Discover music, explore albums, listen to your favorite tracks,
                and give artists a place to share their work with the world.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <NavLink
                  to="/"
                  className="inline-flex items-center gap-3 rounded-full bg-amber-500 px-7 py-3.5 font-bold text-gray-950 transition hover:bg-amber-400"
                >
                  <FaPlay className="text-sm" />
                  Start Listening
                </NavLink>

                <NavLink
                  to="/album"
                  className="inline-flex items-center gap-3 rounded-full border border-gray-700 px-7 py-3.5 font-semibold transition hover:border-amber-500 hover:text-amber-500"
                >
                  Explore Albums
                  <FaArrowRight className="text-sm" />
                </NavLink>
              </div>
            </div>

            {/* Visual */}

            <div className="hidden justify-center lg:flex">
              <div className="relative flex h-80 w-80 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-3xl" />

                <div className="relative flex h-64 w-64 items-center justify-center rounded-full border border-amber-500/20 bg-gray-900 shadow-2xl">
                  <div className="absolute h-52 w-52 rounded-full border border-gray-800" />

                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-amber-500 text-gray-950 shadow-xl">
                    <FaMusic className="text-5xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          What Is Spookeify
      ======================================== */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-medium text-amber-500">Our Platform</p>

            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              A place where music and artists meet.
            </h2>

            <p className="mt-5 leading-8 text-gray-400">
              Spookeify is designed to make music simple to discover and easy to
              share. Listeners can explore songs and albums while artists can
              upload their own music and organize their tracks into albums.
            </p>

            <p className="mt-4 leading-8 text-gray-400">
              Whether you are here to discover your next favorite song or share
              music you have created, Spookeify gives you the tools to enjoy and
              manage your music in one place.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <FaHeadphones className="text-xl" />
              </div>

              <h3 className="text-lg font-bold">For Listeners</h3>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                Discover music, explore albums and enjoy tracks from different
                artists.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <FaMicrophone className="text-xl" />
              </div>

              <h3 className="text-lg font-bold">For Artists</h3>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                Upload your music, create albums and manage your releases from
                your artist dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          Features
      ======================================== */}

      <section className="border-y border-gray-800 bg-gray-900/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-amber-500">
              What You Can Do
            </p>

            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              Everything you need for your music.
            </h2>

            <p className="mt-4 text-gray-400">
              Spookeify brings music discovery and artist management together in
              one simple platform.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}

            <div className="group rounded-2xl border border-gray-800 bg-gray-900 p-6 transition hover:-translate-y-1 hover:border-amber-500/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 transition group-hover:bg-amber-500 group-hover:text-gray-950">
                <FaMusic />
              </div>

              <h3 className="mt-5 text-lg font-bold">Discover Music</h3>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                Browse and listen to music uploaded by artists on the platform.
              </p>
            </div>

            {/* Feature 2 */}

            <div className="group rounded-2xl border border-gray-800 bg-gray-900 p-6 transition hover:-translate-y-1 hover:border-amber-500/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 transition group-hover:bg-amber-500 group-hover:text-gray-950">
                <FaCompactDisc />
              </div>

              <h3 className="mt-5 text-lg font-bold">Explore Albums</h3>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                Explore albums and discover multiple tracks from your favorite
                artists.
              </p>
            </div>

            {/* Feature 3 */}

            <div className="group rounded-2xl border border-gray-800 bg-gray-900 p-6 transition hover:-translate-y-1 hover:border-amber-500/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 transition group-hover:bg-amber-500 group-hover:text-gray-950">
                <FaUpload />
              </div>

              <h3 className="mt-5 text-lg font-bold">Upload Music</h3>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                Artists can upload their tracks and make their music available
                to listeners.
              </p>
            </div>

            {/* Feature 4 */}

            <div className="group rounded-2xl border border-gray-800 bg-gray-900 p-6 transition hover:-translate-y-1 hover:border-amber-500/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 transition group-hover:bg-amber-500 group-hover:text-gray-950">
                <FaUsers />
              </div>

              <h3 className="mt-5 text-lg font-bold">Built for Everyone</h3>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                A simple experience designed for both music listeners and
                independent artists.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          Artist Section
      ======================================== */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-linear-to-r from-amber-500 to-orange-600 p-8 text-gray-950 sm:p-12">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em]">
                For Artists
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Your music deserves to be heard.
              </h2>

              <p className="mt-4 max-w-xl leading-7 text-gray-900/80">
                Upload your tracks, organize them into albums and manage your
                releases through your dedicated artist dashboard.
              </p>

              <NavLink
                to="/create-music"
                className="mt-7 inline-flex items-center gap-3 rounded-full bg-gray-950 px-7 py-3.5 font-bold text-white transition hover:bg-gray-800"
              >
                Start Uploading
                <FaArrowRight />
              </NavLink>
            </div>

            <div className="hidden justify-center md:flex">
              <div className="flex h-52 w-52 items-center justify-center rounded-full bg-gray-950/10">
                <FaMicrophone className="text-7xl text-gray-950/80" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          Simple Stats
      ======================================== */}

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-7 text-center">
            <FaMusic className="mx-auto text-2xl text-amber-500" />

            <h3 className="mt-4 text-2xl font-black">Music</h3>

            <p className="mt-2 text-sm text-gray-400">
              Discover tracks from artists on the platform.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-7 text-center">
            <FaCompactDisc className="mx-auto text-2xl text-amber-500" />

            <h3 className="mt-4 text-2xl font-black">Albums</h3>

            <p className="mt-2 text-sm text-gray-400">
              Explore collections of songs organized by artists.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-7 text-center">
            <FaUsers className="mx-auto text-2xl text-amber-500" />

            <h3 className="mt-4 text-2xl font-black">Community</h3>

            <p className="mt-2 text-sm text-gray-400">
              Connect listeners and artists through music.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================
          Final CTA
      ======================================== */}

      <section className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-amber-500">Ready to listen?</p>

          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            Find your next favorite song.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-gray-400">
            Explore music, discover new artists and enjoy your listening
            experience with Spookeify.
          </p>

          <NavLink
            to="/"
            className="mt-7 inline-flex items-center gap-3 rounded-full bg-amber-500 px-7 py-3.5 font-bold text-gray-950 transition hover:bg-amber-400"
          >
            <FaPlay className="text-sm" />
            Start Listening
          </NavLink>
        </div>
      </section>

      {/* ========================================
          Footer
      ======================================== */}

      <footer className="border-t border-gray-800 px-4 py-8 text-center text-sm text-gray-500">
        <p>© 2026 Spookeify. Your music, your way.</p>
      </footer>
    </div>
  );
};
