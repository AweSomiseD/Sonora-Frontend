import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaComments,
  FaExternalLinkAlt,
  FaFlag,
  FaMusic,
  FaPlay,
} from "react-icons/fa";
import { AlbumTile } from "./Album.jsx";
import { FollowButton } from "../components/FollowButton.jsx";
import { MusicCard, TrackRow } from "../components/MusicCard.jsx";
import ReportModal from "../components/ReportModal.jsx";
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Skeleton,
  SkeletonGrid,
} from "../components/ui/index.jsx";
import { genreLabel } from "../constants/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import { usePlayer } from "../context/PlayerContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import api, { getErrorMessage } from "../services/api.js";
import { artistName, formatCount } from "../utils/format.js";
import PremiumBadge from "../components/PremiumBadge.jsx";

const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export const ArtistDetails = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playQueue } = usePlayer();
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [startingChat, setStartingChat] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  usePageTitle(data ? artistName(data.artist) : "Artist");

  const load = () => {
    setError("");
    api
      .get(`/music/artists/${artistId}`)
      .then(({ data: response }) => setData(response))
      .catch((err) => setError(getErrorMessage(err, "Artist not found")));
  };
  useEffect(load, [artistId]);

  const startChat = async () => {
    setStartingChat(true);
    try {
      const { data: response } = await api.post("/messages/conversations", {
        artistId,
      });
      navigate("/listener/messages", {
        state: { conversation: response.conversation },
      });
    } catch (err) {
      showToast(
        getErrorMessage(err, "Could not start a conversation"),
        "error",
      );
    } finally {
      setStartingChat(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-56 w-full" />
        <SkeletonGrid count={5} />
      </div>
    );
  }

  const { artist, musics, topTracks, albums } = data;
  const profile = artist.artistProfile || {};
  const isMe = String(user?._id) === String(artist._id);
  const followerCount = artist.followerCount || 0;

  return (
    <div className="animate-fade-in-up">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex min-h-10 cursor-pointer items-center gap-2 text-sm text-gray-400 hover:text-white"
      >
        <FaArrowLeft aria-hidden="true" /> Back
      </button>

      <div className="relative overflow-hidden rounded-2xl border border-violet-500/10">
        <div className="h-40 sm:h-56">
          {profile.banner ? (
            <img
              src={profile.banner}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-violet-700/50 via-fuchsia-700/30 to-gray-900" />
          )}
        </div>
        <div className="relative -mt-14 flex flex-col gap-4 px-5 pb-6 sm:-mt-16 sm:flex-row sm:items-end sm:px-8">
          <Avatar
            src={artist.avatar}
            name={artistName(artist)}
            size="xl"
            className="border-4 border-gray-950"
          />
          <div className="min-w-0 flex-1">
            <h1 className="flex flex-wrap items-center gap-2 text-3xl font-black text-white sm:text-4xl">
              {artistName(artist)}
              {profile.verified && (
                <FaCheckCircle
                  className="text-2xl text-sky-400"
                  aria-label="Verified artist"
                />
              )}
              {artist.isPremium && <PremiumBadge />}
            </h1>
            <p className="mt-1 text-sm text-gray-300">
              {formatCount(followerCount)} followers ·{" "}
              {formatCount(artist.totalPlays)} plays · {musics.length} songs
            </p>
            {profile.genres?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {profile.genres.map((g) => (
                  <Badge key={g}>{genreLabel(g)}</Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {musics.length > 0 && (
              <Button
                icon={FaPlay}
                onClick={() =>
                  playQueue(topTracks.length ? topTracks : musics, 0)
                }
              >
                Play
              </Button>
            )}
            {!isMe && (
              <FollowButton
                artistId={artist._id}
                onChange={(following) =>
                  setData((d) => ({
                    ...d,
                    artist: {
                      ...d.artist,
                      followerCount:
                        d.artist.followerCount + (following ? 1 : -1),
                    },
                  }))
                }
              />
            )}
            {!isMe && (
              <Button
                variant="secondary"
                icon={FaComments}
                loading={startingChat}
                onClick={startChat}
              >
                Message
              </Button>
            )}
            {!isMe && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setReportOpen(true)}
                aria-label="Report artist"
              >
                <FaFlag aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {(profile.bio || profile.links?.length > 0) && (
        <div className="mt-6 rounded-2xl border border-violet-500/10 bg-gray-900/50 p-5">
          {profile.bio && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-300">
              {profile.bio}
            </p>
          )}
          {profile.links?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.links.map((link) => (
                <a
                  key={link}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex min-h-9 items-center gap-2 rounded-full border border-violet-500/20 px-3 text-xs text-violet-200 hover:bg-violet-500/10"
                >
                  <FaExternalLinkAlt aria-hidden="true" /> {hostOf(link)}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {musics.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={FaMusic}
            title="No songs yet"
            message="This artist has not published any music yet."
          />
        </div>
      ) : (
        <>
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-bold text-white">Popular</h2>
            <ol className="space-y-1">
              {topTracks.map((music, index) => (
                <TrackRow
                  key={music._id}
                  music={music}
                  list={topTracks}
                  index={index}
                  number={index + 1}
                  extra={`${formatCount(music.playCount)} plays`}
                />
              ))}
            </ol>
          </section>
          {albums.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 text-lg font-bold text-white">Albums</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {albums.map((album) => (
                  <AlbumTile
                    key={album._id}
                    album={album}
                    to={`/listener/album/${album._id}`}
                  />
                ))}
              </div>
            </section>
          )}
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-bold text-white">All songs</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {musics.map((music, index) => (
                <MusicCard
                  key={music._id}
                  music={music}
                  list={musics}
                  index={index}
                />
              ))}
            </div>
          </section>
        </>
      )}
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="user"
        targetId={artist._id}
        targetLabel={artistName(artist)}
      />
    </div>
  );
};

export default ArtistDetails;
