import { useEffect, useState } from "react";
import { FaClock } from "react-icons/fa";
import api from "../services/api.js";
import { MusicCard } from "../components/MusicCard";
import { MusicPlayer } from "../components/MusicPlayer";

export const RecentlyPlayed = () => {
  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentMusic, setCurrentMusic] = useState(null);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/music/recently-played");

        setMusics(response.data.musics || []);
      } catch (error) {
        console.error("Failed to fetch recently played:", error);
        setError("Unable to load recently played songs.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecent();
  }, []);

  return (
    <div className="px-8 py-10">
      <p className="text-sm font-medium text-amber-500">Your History</p>
      <h1 className="mt-1 text-3xl font-bold">Recently Played</h1>

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
          <FaClock className="mx-auto text-4xl text-gray-700" />
          <h3 className="mt-4 text-xl font-bold">No listening history yet</h3>
          <p className="mt-2 text-gray-400">Songs you play will appear here.</p>
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
