import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaHistory, FaPlay } from "react-icons/fa";
import { TrackRow } from "../components/MusicCard.jsx";
import { Button, EmptyState, ErrorState, PageHeader, SkeletonList } from "../components/ui/index.jsx";
import { usePlayer } from "../context/PlayerContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import api, { getErrorMessage } from "../services/api.js";
import { timeAgo } from "../utils/format.js";

export const RecentlyPlayed = () => {
  usePageTitle("Recently Played");
  const { playQueue } = usePlayer();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    api
      .get("/music/recently-played")
      .then(({ data }) => setItems(data.items))
      .catch((err) => setError(getErrorMessage(err)));
  };
  useEffect(load, []);

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Recently Played"
        subtitle="Songs you listened to lately"
        icon={FaHistory}
        actions={items?.length > 0 && <Button icon={FaPlay} onClick={() => playQueue(items, 0)}>Play all</Button>}
      />
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !items ? (
        <SkeletonList count={8} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={FaHistory}
          title="Nothing here yet"
          message="Songs count as played after about 30 seconds of listening."
          action={<Link to="/listener/discover" className="font-semibold text-violet-300 hover:underline">Start listening</Link>}
        />
      ) : (
        <ol className="space-y-1">
          {items.map((music, index) => (
            <TrackRow key={music._id} music={music} list={items} index={index} extra={timeAgo(music.lastPlayedAt)} />
          ))}
        </ol>
      )}
    </div>
  );
};

export default RecentlyPlayed;
