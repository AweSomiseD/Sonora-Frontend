import { FaPlay } from "react-icons/fa";
import { LikeButton } from "./LikeButton";

export const MusicCard = ({ music, onPlay }) => {
  return (
    <div className="flex items-center gap-4 border-b border-gray-800 px-4 py-4 transition last:border-b-0 hover:bg-gray-800 sm:px-6">
      {/* Song Icon / Cover */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-amber-500/10 text-amber-500">
        {music.coverImage ? (
          <img
            src={music.coverImage}
            alt={music.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <FaPlay className="text-sm" />
        )}
      </div>

      {/* Song Information */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-white">{music.title}</h3>

        <p className="truncate text-sm text-gray-400">
          {music.artist?.username || "Unknown Artist"}
        </p>
      </div>

      <LikeButton musicId={music._id} />

      {/* Play Button */}
      <button
        onClick={() => onPlay(music)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-amber-500 hover:text-gray-950"
      >
        <FaPlay className="text-xs" />
      </button>
    </div>
  );
};
