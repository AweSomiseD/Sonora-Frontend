import { Link } from "react-router-dom";
import { FaCompactDisc } from "react-icons/fa";
import { EmptyState, ErrorState, LoadMore, PageHeader, SkeletonGrid } from "../components/ui/index.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import usePaginatedList from "../hooks/usePaginatedList.js";
import { artistName } from "../utils/format.js";

export function AlbumTile({ album, to }) {
  return (
    <Link to={to} className="group rounded-2xl border border-violet-500/10 bg-gray-900/50 p-3 transition hover:border-violet-500/30 hover:bg-gray-900/80">
      <div className="aspect-square overflow-hidden rounded-xl">
        {album.coverImage ? (
          <img src={album.coverImage} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-violet-600/40 to-fuchsia-600/30 text-3xl text-violet-200">
            <FaCompactDisc aria-hidden="true" />
          </div>
        )}
      </div>
      <h3 className="mt-3 truncate text-sm font-semibold text-white">{album.title}</h3>
      <p className="truncate text-xs text-gray-400">
        {artistName(album.artist)} · {album.trackCount ?? album.musics?.length ?? 0} songs
      </p>
    </Link>
  );
}

export const Album = () => {
  usePageTitle("Albums");
  const { items, loading, loadingMore, hasMore, error, loadMore, reload } = usePaginatedList("/music/albums", {}, { limit: 24 });

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Albums" subtitle="Collections from Sonora artists" icon={FaCompactDisc} />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <SkeletonGrid count={10} />
      ) : items.length === 0 ? (
        <EmptyState icon={FaCompactDisc} title="No albums yet" message="When artists create albums they will appear here." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {items.map((album) => (
              <AlbumTile key={album._id} album={album} to={`/listener/album/${album._id}`} />
            ))}
          </div>
          <LoadMore hasMore={hasMore} loading={loadingMore} onClick={loadMore} />
        </>
      )}
    </div>
  );
};

export default Album;
