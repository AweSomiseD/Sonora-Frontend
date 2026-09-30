import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import api from "../services/api.js";
import { MusicCard } from "../components/MusicCard";
import { MusicPlayer } from "../components/MusicPlayer";

export const Liked = () => {
  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentMusic, setCurrentMusic] = useState(null);

  useEffect(() => {
    const fetchLiked = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/music/liked");

        setMusics(response.data.musics || []);
      } catch (error) {
        console.error("Failed to fetch liked music:", error);
        setError("Unable to load liked songs.");
      } finally {
        setLoading(false);
      }
    };

    fetchLiked();
  }, []);

  return (
    <div className="px-8 py-10">
      <p className="text-sm font-medium text-amber-500">Your Favorites</p>
      <h1 className="mt-1 text-3xl font-bold">Liked Songs</h1>

      {loading ? (
        <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      ) : error ? (
        <div className="mt-8 rounded-2xl border border-red-900 bg-red-950/30 p-8 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      ) : musics.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-700 bg-gray-900 p-10 text-center">
          <FaHeart className="mx-auto text-4xl text-gray-700" />
          <h3 className="mt-4 text-xl font-bold">No liked songs yet</h3>
          <p className="mt-2 text-gray-400">Songs you like will appear here.</p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
          {musics.map((music) => (
            <MusicCard key={music._id} music={music} onPlay={setCurrentMusic} />
          ))}
        </div>
      )}

      {currentMusic && (
        <MusicPlayer
          music={currentMusic}
          onClose={() => setCurrentMusic(null)}
        />
      )}
    </div>
  );
};
