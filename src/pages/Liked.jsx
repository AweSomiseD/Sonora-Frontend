import { Link } from "react-router-dom";
import { FaHeart, FaPlay, FaRandom } from "react-icons/fa";
import { TrackRow } from "../components/MusicCard.jsx";
import { Button, EmptyState, ErrorState, LoadMore, PageHeader, SkeletonList } from "../components/ui/index.jsx";
import { usePlayer } from "../context/PlayerContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import usePaginatedList from "../hooks/usePaginatedList.js";

export const Liked = () => {
  usePageTitle("Liked Songs");
  const { playQueue, shuffle, toggleShuffle } = usePlayer();
  const { items, total, loading, loadingMore, hasMore, error, loadMore, reload } = usePaginatedList("/music/liked", {}, { limit: 50 });

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Liked Songs"
        subtitle={loading ? "Loading..." : `${total} song${total === 1 ? "" : "s"}`}
        icon={FaHeart}
        actions={
          items.length > 0 && (
            <>
              <Button icon={FaPlay} onClick={() => playQueue(items, 0)}>
                Play all
              </Button>
              <Button
                variant="secondary"
                icon={FaRandom}
                onClick={() => {
                  if (!shuffle) toggleShuffle();
                  playQueue(items, Math.floor(Math.random() * items.length));
                }}
              >
                Shuffle
              </Button>
            </>
          )
        }
      />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <SkeletonList count={8} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={FaHeart}
          title="No liked songs yet"
          message="Tap the heart on any song to save it here."
          action={
            <Link to="/listener/discover" className="font-semibold text-violet-300 hover:underline">
              Discover music
            </Link>
          }
        />
      ) : (
        <>
          <ol className="space-y-1">
            {items.map((music, index) => (
              <TrackRow key={music._id} music={music} list={items} index={index} number={index + 1} />
            ))}
          </ol>
          <LoadMore hasMore={hasMore} loading={loadingMore} onClick={loadMore} />
        </>
      )}
    </div>
  );
};

export default Liked;
