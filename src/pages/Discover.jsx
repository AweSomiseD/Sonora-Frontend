import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import debounce from "debounce";
import { FaCompass, FaHistory, FaSearch, FaTimes } from "react-icons/fa";
import { MusicCard, TrackRow } from "../components/MusicCard.jsx";
import { Avatar, Button, EmptyState, ErrorState, LoadMore, PageHeader, SkeletonGrid, Tabs } from "../components/ui/index.jsx";
import { GENRES, genreLabel } from "../constants/index.js";
import usePageTitle from "../hooks/usePageTitle.js";
import usePaginatedList from "../hooks/usePaginatedList.js";
import api, { getErrorMessage } from "../services/api.js";
import { artistName } from "../utils/format.js";
import { addRecentSearch, clearRecentSearches, getRecentSearches } from "../utils/recentSearches.js";

function Shelf({ title, tracks }) {
  if (!tracks?.length) return null;
  return (
    <section>
      <h2 className="mb-3 text-lg font-bold text-white">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {tracks.map((music, index) => (
          <MusicCard key={music._id} music={music} list={tracks} index={index} />
        ))}
      </div>
    </section>
  );
}

function SearchResults({ query, results, type, setType }) {
  const tabs = [
    { value: "all", label: "All" },
    { value: "songs", label: "Songs", count: results?.songs?.total },
    { value: "artists", label: "Artists", count: results?.artists?.total },
    { value: "albums", label: "Albums", count: results?.albums?.total },
  ];
  const songs = results?.songs?.items || [];
  const artists = results?.artists?.items || [];
  const albums = results?.albums?.items || [];
  const nothing = !songs.length && !artists.length && !albums.length;

  return (
    <div className="space-y-6">
      <Tabs tabs={tabs} value={type} onChange={setType} />
      {nothing ? (
        <EmptyState icon={FaSearch} title={`No results for "${query}"`} message="Check the spelling or try another word." />
      ) : (
        <>
          {(type === "all" || type === "songs") && songs.length > 0 && (
            <section>
              <h2 className="mb-2 text-lg font-bold text-white">Songs</h2>
              <ul className="space-y-1">
                {songs.map((music, index) => (
                  <TrackRow key={music._id} music={music} list={songs} index={index} />
                ))}
              </ul>
            </section>
          )}
          {(type === "all" || type === "artists") && artists.length > 0 && (
            <section>
              <h2 className="mb-2 text-lg font-bold text-white">Artists</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
                {artists.map((artist) => (
                  <Link key={artist._id} to={`/listener/artists/${artist._id}`} className="flex flex-col items-center rounded-2xl border border-violet-500/10 bg-gray-900/50 p-4 text-center hover:border-violet-500/30">
                    <Avatar src={artist.avatar} name={artistName(artist)} size="lg" />
                    <span className="mt-2 truncate text-sm font-semibold text-white">{artistName(artist)}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
          {(type === "all" || type === "albums") && albums.length > 0 && (
            <section>
              <h2 className="mb-2 text-lg font-bold text-white">Albums</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
                {albums.map((album) => (
                  <Link key={album._id} to={`/listener/album/${album._id}`} className="rounded-2xl border border-violet-500/10 bg-gray-900/50 p-3 hover:border-violet-500/30">
                    {album.coverImage ? <img src={album.coverImage} alt="" className="aspect-square w-full rounded-xl object-cover" /> : <div className="aspect-square w-full rounded-xl bg-linear-to-br from-violet-600/40 to-fuchsia-600/30" />}
                    <p className="mt-2 truncate text-sm font-semibold text-white">{album.title}</p>
                    <p className="truncate text-xs text-gray-400">{artistName(album.artist)}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export const Discover = () => {
  usePageTitle("Discover");
  const [sections, setSections] = useState(null);
  const [sectionsError, setSectionsError] = useState("");
  const [genre, setGenre] = useState("");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [recent, setRecent] = useState(getRecentSearches);
  const [retry, setRetry] = useState(0);
  const requestId = useRef(0);

  const loadSections = () => {
    setSectionsError("");
    api.get("/music/discover").then(({ data }) => setSections(data)).catch((err) => setSectionsError(getErrorMessage(err)));
  };
  useEffect(loadSections, []);

  const genreList = usePaginatedList("/music", { genre, sort: "new" }, { enabled: Boolean(genre), limit: 24 });

  const runSearch = useMemo(
    () =>
      debounce(async (q, searchType, id) => {
        try {
          const { data } = await api.get(`/music/search?q=${encodeURIComponent(q)}&type=${searchType}`);
          if (id !== requestId.current) return;
          setResults(data);
          setRecent(addRecentSearch(q));
        } catch (err) {
          if (id === requestId.current) setSearchError(getErrorMessage(err, "Search failed"));
        } finally {
          if (id === requestId.current) setSearching(false);
        }
      }, 350),
    [],
  );

  useEffect(() => {
    const id = ++requestId.current;
    const q = query.trim();
    if (!q) {
      runSearch.clear();
      setResults(null);
      setSearching(false);
      return undefined;
    }
    setSearching(true);
    setSearchError("");
    runSearch(q, type, id);
    return () => runSearch.clear();
  }, [query, type, runSearch, retry]);

  return (
    <div className="animate-fade-in-up space-y-8">
      <PageHeader title="Discover" subtitle="Find new songs, artists and albums" icon={FaCompass} />

      <div className="relative">
        <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
        <input
          type="search"
          value={query}
          maxLength={50}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, artists or albums"
          aria-label="Search songs, artists or albums"
          className="min-h-12 w-full rounded-2xl border border-violet-500/20 bg-gray-900/70 pl-11 pr-11 text-white placeholder-gray-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-gray-400 hover:text-white" aria-label="Clear search">
            <FaTimes aria-hidden="true" />
          </button>
        )}
      </div>

      {!query && recent.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <FaHistory className="text-gray-500" aria-hidden="true" />
          {recent.map((q) => (
            <button key={q} type="button" onClick={() => setQuery(q)} className="min-h-8 cursor-pointer rounded-full border border-violet-500/20 px-3 text-xs text-gray-300 hover:border-violet-400/50 hover:text-white">
              {q}
            </button>
          ))}
          <button type="button" onClick={() => setRecent(clearRecentSearches())} className="cursor-pointer text-xs text-gray-500 underline hover:text-gray-300">
            Clear
          </button>
        </div>
      )}

      {query.trim() ? (
        searchError ? (
          <ErrorState message={searchError} onRetry={() => setRetry((n) => n + 1)} />
        ) : searching && !results ? (
          <SkeletonGrid count={6} />
        ) : (
          results && <SearchResults query={query.trim()} results={results} type={type} setType={setType} />
        )
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin" role="group" aria-label="Browse by genre">
            <button type="button" onClick={() => setGenre("")} aria-pressed={!genre} className={`min-h-9 shrink-0 cursor-pointer rounded-full px-4 text-sm font-medium ${!genre ? "bg-violet-500/30 text-white" : "border border-violet-500/20 text-gray-300 hover:text-white"}`}>
              For you
            </button>
            {GENRES.map((g) => (
              <button key={g} type="button" onClick={() => setGenre(g)} aria-pressed={genre === g} className={`min-h-9 shrink-0 cursor-pointer rounded-full px-4 text-sm font-medium ${genre === g ? "bg-violet-500/30 text-white" : "border border-violet-500/20 text-gray-300 hover:text-white"}`}>
                {genreLabel(g)}
              </button>
            ))}
          </div>

          {genre ? (
            genreList.error ? (
              <ErrorState message={genreList.error} onRetry={genreList.reload} />
            ) : genreList.loading ? (
              <SkeletonGrid />
            ) : genreList.items.length === 0 ? (
              <EmptyState icon={FaCompass} title={`No ${genreLabel(genre)} songs yet`} message="Try another genre." action={<Button variant="secondary" onClick={() => setGenre("")}>Back to For you</Button>} />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
                  {genreList.items.map((music, index) => (
                    <MusicCard key={music._id} music={music} list={genreList.items} index={index} />
                  ))}
                </div>
                <LoadMore hasMore={genreList.hasMore} loading={genreList.loadingMore} onClick={genreList.loadMore} />
              </>
            )
          ) : sectionsError ? (
            <ErrorState message={sectionsError} onRetry={loadSections} />
          ) : !sections ? (
            <SkeletonGrid count={12} />
          ) : (
            <div className="space-y-10">
              <Shelf title="Trending this week" tracks={sections.trending} />
              <Shelf title="New releases" tracks={sections.newReleases} />
              <Shelf title="New from artists you follow" tracks={sections.fromFollowed} />
              <Shelf title="Recently played" tracks={sections.recentlyPlayed} />
              {!sections.trending.length && !sections.newReleases.length && (
                <EmptyState icon={FaCompass} title="No music yet" message="When artists upload songs, they will appear here." />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Discover;
