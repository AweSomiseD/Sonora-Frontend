import { useEffect, useState } from "react";
import { FaArrowLeft, FaMusic } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import api from "../services/api.js";
import { FollowButton } from "../components/FollowButton";
import { MusicCard } from "../components/MusicCard";
import { MusicPlayer } from "../components/MusicPlayer";

export const ArtistDetails = () => {
  const { artistId } = useParams();
  const [artist, setArtist] = useState(null);
  const [musics, setMusics] = useState([]);
  const [currentMusic, setCurrentMusic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get(`/music/artists/${artistId}`);
        setArtist(response.data.artist);
        setMusics(response.data.musics || []);
      } finally { setLoading(false); }
    };
    load();
  }, [artistId]);

  if (loading) return <div className="p-10 text-gray-400">Loading artist...</div>;
  if (!artist) return <div className="p-10 text-gray-400">Artist not found.</div>;
  return <div className="px-8 py-10">
    <Link to="/listener/artists" className="inline-flex items-center gap-2 text-gray-400 hover:text-white"><FaArrowLeft /> Artists</Link>
    <section className="mt-8 flex flex-wrap items-center gap-5 rounded-2xl border border-gray-800 bg-gray-900 p-6">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-500/10 text-amber-500"><FaMusic className="text-3xl" /></div>
      <div><p className="text-sm text-amber-500">Artist</p><h1 className="text-3xl font-bold">{artist.username}</h1><div className="mt-3"><FollowButton artistId={artist._id} /></div></div>
    </section>
    <h2 className="mt-10 text-2xl font-bold">Songs</h2>
    {musics.length === 0 ? <p className="mt-5 text-gray-400">No songs available</p> :
      <div className="mt-5 overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">{musics.map((music) =>
        <MusicCard key={music._id} music={music} onPlay={setCurrentMusic} />)}</div>}
    {currentMusic && <MusicPlayer music={currentMusic} onClose={() => setCurrentMusic(null)} />}
  </div>;
};
