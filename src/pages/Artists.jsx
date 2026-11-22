import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaMicrophone, FaSearch } from "react-icons/fa";
import {
  Avatar,
  EmptyState,
  ErrorState,
  LoadMore,
  PageHeader,
  SkeletonGrid,
} from "../components/ui/index.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import usePaginatedList from "../hooks/usePaginatedList.js";
import { artistName, formatCount } from "../utils/format.js";
import PremiumBadge from "../components/PremiumBadge.jsx";

export const Artists = () => {
  usePageTitle("Artists");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  // small debounce so we do not search on every key press
  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { items, loading, loadingMore, hasMore, error, loadMore, reload } =
    usePaginatedList("/music/artists", { q: query }, { limit: 24 });

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Artists"
        subtitle="Find artists and follow them"
        icon={FaMicrophone}
      />
      <div className="relative mb-6 max-w-md">
        <FaSearch
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          maxLength={50}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search artists"
          aria-label="Search artists"
          className="min-h-11 w-full rounded-xl border border-violet-500/20 bg-gray-900/70 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
        />
      </div>
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading ? (
        <SkeletonGrid count={10} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={FaMicrophone}
          title={query ? `No artists match "${query}"` : "No artists yet"}
          message={
            query
              ? "Try a different search term."
              : "Artists appear here after an admin approves them."
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {items.map((artist) => (
              <Link
                key={artist._id}
                to={`/listener/artists/${artist._id}`}
                className="group flex flex-col items-center rounded-2xl border border-violet-500/10 bg-gray-900/50 p-5 text-center transition hover:border-violet-500/30 hover:bg-gray-900/80"
              >
                <Avatar
                  src={artist.avatar}
                  name={artistName(artist)}
                  size="lg"
                  className="transition group-hover:scale-105"
                />
                <span className="mt-3 flex max-w-full items-center gap-1 truncate text-sm font-semibold text-white">
                  {artistName(artist)}
                  {artist.artistProfile?.verified && (
                    <FaCheckCircle
                      className="shrink-0 text-sky-400"
                      aria-label="Verified artist"
                    />
                  )}
                  {artist.isPremium && <PremiumBadge />}
                </span>
                <span className="text-xs text-gray-500">
                  {formatCount(artist.followerCount)} followers
                </span>
              </Link>
            ))}
          </div>
          <LoadMore
            hasMore={hasMore}
            loading={loadingMore}
            onClick={loadMore}
          />
        </>
      )}
    </div>
  );
};

export default Artists;
