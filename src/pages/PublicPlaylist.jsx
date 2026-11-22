import { Link, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import PlayerBar from "../components/PlayerBar.jsx";
import PlaylistView from "../components/PlaylistView.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getDashboardPath } from "../routes/routePaths.js";

// Share link page (/playlists/:id). It lives outside the dashboard layout,
// so it renders its own small header and the player bar.
export default function PublicPlaylist() {
  const { id } = useParams();
  const { activeRole } = useAuth();
  return (
    <div className="relative min-h-screen pb-28">
      <header className="sticky top-0 z-30 border-b border-violet-500/10 bg-gray-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to={getDashboardPath(activeRole)} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white">
            <FaArrowLeft aria-hidden="true" /> Back to Sonora
          </Link>
          <span className="bg-linear-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-lg font-black text-transparent">Sonora</span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <PlaylistView key={id} playlistId={id} />
      </main>
      <PlayerBar />
    </div>
  );
}
