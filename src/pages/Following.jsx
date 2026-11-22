import { Link } from "react-router-dom";
import { FaUserFriends } from "react-icons/fa";
import { FollowButton } from "../components/FollowButton.jsx";
import { Avatar, EmptyState, ErrorState, LoadMore, PageHeader, SkeletonGrid } from "../components/ui/index.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import usePaginatedList from "../hooks/usePaginatedList.js";
import { artistName, formatCount } from "../utils/format.js";

export const Following = () => {
  usePageTitle("Following");
  const { items, setItems, total, setTotal, loading, loadingMore, hasMore, error, loadMore, reload } = usePaginatedList("/music/followed-artists", {}, { limit: 48 });

  const onUnfollow = (artistId, following) => {
    if (following) return;
    setItems((prev) => prev.filter((a) => a._id !== artistId));
    setTotal((t) => Math.max(0, t - 1));
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Following" subtitle={loading ? "Loading..." : `${total} artist${total === 1 ? "" : "s"}`} icon={FaUserFriends} />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <SkeletonGrid count={8} />
      ) : items.length === 0 ? (
        <EmptyState icon={FaUserFriends} title="You are not following anyone yet" message="Follow artists to get notified about their new releases." action={<Link to="/listener/artists" className="font-semibold text-violet-300 hover:underline">Browse artists</Link>} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((artist) => (
              <div key={artist._id} className="flex flex-col items-center rounded-2xl border border-violet-500/10 bg-gray-900/50 p-5 text-center">
                <Link to={`/listener/artists/${artist._id}`} className="flex flex-col items-center">
                  <Avatar src={artist.avatar} name={artistName(artist)} size="lg" />
                  <span className="mt-3 truncate text-sm font-semibold text-white hover:underline">{artistName(artist)}</span>
                </Link>
                <span className="mb-3 text-xs text-gray-500">{formatCount(artist.followerCount)} followers</span>
                <FollowButton artistId={artist._id} onChange={(following) => onUnfollow(artist._id, following)} />
              </div>
            ))}
          </div>
          <LoadMore hasMore={hasMore} loading={loadingMore} onClick={loadMore} />
        </>
      )}
    </div>
  );
};

export default Following;
