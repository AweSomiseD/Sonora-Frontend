import { useEffect, useState } from "react";
import { FaArrowLeft, FaMusic, FaCommentDots } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api.js";
import { FollowButton } from "../components/FollowButton";
import { MusicCard } from "../components/MusicCard";
import { MusicPlayer } from "../components/MusicPlayer";

export const ArtistDetails = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();

  const [artist, setArtist] = useState(null);
  const [musics, setMusics] = useState([]);
  const [currentMusic, setCurrentMusic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get(`/music/artists/${artistId}`);

        setArtist(response.data.artist);
        setMusics(response.data.musics || []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [artistId]);

  const handleMessageArtist = async () => {
    try {
      setStartingChat(true);

      const response = await api.post("/messages/conversations", {
        artistId,
      });

      const conversation = response.data.conversation;
      navigate("/listener/messages", {
        state: {
          conversation,
        },
      });

      console.log("Conversation:", conversation);

      // Temporary:
      // Abhi sirf conversation create/open verify kar rahe hain.
      // Next step mein isi conversation ko Chat UI mein open karenge.
    } catch (error) {
      console.error("Start conversation error:", error);

      console.error(
        error.response?.data?.message || "Unable to start conversation",
      );
    } finally {
      setStartingChat(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-20 h-96 w-96 animate-pulse rounded-full bg-violet-500/10 blur-[120px]" />
          <div
            className="absolute -right-40 bottom-20 h-96 w-96 animate-pulse rounded-full bg-fuchsia-600/8 blur-[120px]"
            style={{ animationDelay: "1.5s" }}
          />
        </div>

        <div className="relative z-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
          </div>
          <p className="mt-4 text-gray-400">Loading artist...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (!artist) {
    return (
      <div className="relative min-h-screen overflow-hidden px-8 py-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-20 h-96 w-96 animate-pulse rounded-full bg-violet-500/10 blur-[120px]" />
          <div
            className="absolute -right-40 bottom-20 h-96 w-96 animate-pulse rounded-full bg-fuchsia-600/8 blur-[120px]"
            style={{ animationDelay: "1.5s" }}
          />
        </div>

        <div className="relative z-10">
          <Link
            to="/listener/artists"
            className="group mb-8 inline-flex items-center gap-2 rounded-full border border-gray-700/50 bg-gray-900/50 px-4 py-2 text-sm text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/50 hover:bg-violet-500/5 hover:text-violet-300"
          >
            <FaArrowLeft className="text-xs transition-transform duration-300 group-hover:-translate-x-0.5" />
            Artists
          </Link>

          <div className="rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-10 text-center backdrop-blur-sm">
            <p className="text-gray-400">Artist not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Keyframes */}
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.03); }
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
        {/* Back */}
        <Link
          to="/listener/artists"
          className="group mb-8 inline-flex items-center gap-2 rounded-full border border-gray-700/50 bg-gray-900/50 px-4 py-2 text-sm text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/50 hover:bg-violet-500/5 hover:text-violet-300"
        >
          <FaArrowLeft className="text-xs transition-transform duration-300 group-hover:-translate-x-0.5" />
          Artists
        </Link>

        {/* ========================================
            Artist Hero Card
        ======================================== */}
        <section className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-linear-to-br from-violet-500/20 via-fuchsia-500/10 to-gray-950 p-6 shadow-[0_20px_60px_-15px_rgba(139,92,246,0.3)] sm:p-8">
          {/* Decorative glow orbs */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-fuchsia-500/15 blur-3xl" />

          <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-left">
            {/* Avatar with gradient ring + glow */}
            <div className="relative h-24 w-24 shrink-0">
              <div className="absolute inset-0 rounded-full bg-linear-to-br from-violet-500/50 to-fuchsia-500/40 blur-md" />
              <div
                className="relative flex h-24 w-24 items-center justify-center rounded-full border border-violet-500/40 bg-linear-to-br from-violet-500/30 to-fuchsia-500/20 text-violet-200 shadow-[0_0_25px_rgba(139,92,246,0.4)]"
                style={{ animation: "floatSlow 5s ease-in-out infinite" }}
              >
                <FaMusic className="text-3xl" />
              </div>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-300 backdrop-blur-sm">
                <FaMusic className="text-[10px]" />
                Artist
              </p>

              <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                <span className="bg-linear-to-r from-white via-violet-100 to-fuchsia-100 bg-clip-text text-transparent">
                  {artist.username}
                </span>
              </h1>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <FollowButton artistId={artist._id} />

                <button
                  onClick={handleMessageArtist}
                  disabled={startingChat}
                  className="group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] disabled:cursor-not-allowed disabled:scale-100 disabled:opacity-50 disabled:shadow-none"
                >
                  <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                  <FaCommentDots className="relative text-xs" />
                  <span className="relative">
                    {startingChat ? "Opening..." : "Message"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================
            Songs
        ======================================== */}
        <div className="mt-10">
          <h2 className="text-3xl font-bold">
            <span className="relative">
              Songs
              <span className="absolute -bottom-2 left-0 h-0.5 w-12 rounded-full bg-linear-to-r from-violet-500 to-transparent" />
            </span>
          </h2>
        </div>

        {musics.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-10 text-center backdrop-blur-sm">
            <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-violet-500/10 blur-2xl" />
              <FaMusic className="relative text-3xl text-violet-500/40" />
            </div>
            <p className="text-gray-400">No songs available</p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 backdrop-blur-sm">
            {musics.map((music) => (
              <MusicCard
                key={music._id}
                music={music}
                onPlay={setCurrentMusic}
              />
            ))}
          </div>
        )}
      </div>

      {currentMusic && (
        <MusicPlayer
          music={currentMusic}
          onClose={() => setCurrentMusic(null)}
        />
      )}
    </div>
  );
};
