import { useEffect, useState } from "react";
import { FaSearch, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import api from "../services/api.js";

export const Artists = () => {
  const [query, setQuery] = useState("");
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await api.get("/music/artists", {
          params: query.trim() ? { q: query.trim() } : {},
        });
        setArtists(response.data.artists || []);
      } catch {
        setArtists([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="px-8 py-10">
      <p className="text-sm font-medium text-amber-500">Discover creators</p>
      <h1 className="mt-1 text-3xl font-bold">Artists</h1>
      <div className="relative mt-6 max-w-md">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search artists..."
          className="w-full rounded-xl border border-gray-700 bg-gray-900 py-3 pl-11 pr-4 text-white outline-none focus:border-amber-500"
        />
      </div>
      {loading ? (
        <p className="mt-8 text-gray-400">Loading artists...</p>
      ) : artists.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center text-gray-400">
          No artists found.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {artists.map((artist) => (
            <Link
              key={artist._id}
              to={`/listener/artists/${artist._id}`}
              className="rounded-2xl border border-gray-800 bg-gray-900 p-6 text-center transition hover:border-amber-500/50 hover:bg-gray-800"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                <FaUser className="text-2xl" />
              </div>
              <h2 className="mt-4 truncate font-bold">{artist.username}</h2>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
