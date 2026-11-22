import { Link } from "react-router-dom";
import { FaClock, FaMicrophoneAlt, FaStar, FaTimesCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import { formatDate } from "../utils/format.js";
import { Badge, Button, Card } from "./ui/index.jsx";

// Listener dashboard card that follows the artist application status
export default function BecomeArtistCard() {
  const { artistRequest, hasArtistRole, switchRole, user } = useAuth();
  const status = hasArtistRole ? "approved" : artistRequest?.status || "none";

  if (user?.roles?.includes("admin")) return null;

  if (status === "approved") {
    return (
      <Card className="border-emerald-500/20 bg-emerald-500/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <FaMicrophoneAlt className="text-2xl text-emerald-300" aria-hidden="true" />
            <div>
              <h2 className="font-bold text-white">You are a verified artist</h2>
              <p className="text-sm text-gray-400">Upload music and see your analytics in Artist Studio.</p>
            </div>
          </div>
          <Button onClick={() => switchRole("artist")}>Switch to Artist Studio</Button>
        </div>
      </Card>
    );
  }

  if (status === "pending") {
    return (
      <Card className="border-amber-500/20 bg-amber-500/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <FaClock className="text-2xl text-amber-300" aria-hidden="true" />
            <div>
              <h2 className="flex items-center gap-2 font-bold text-white">
                Artist application <Badge tone="yellow">Pending review</Badge>
              </h2>
              <p className="text-sm text-gray-400">An admin will review it soon. We will notify you.</p>
            </div>
          </div>
          <Link to="/listener/become-artist" className="text-sm font-semibold text-amber-200 hover:underline">
            View or cancel
          </Link>
        </div>
      </Card>
    );
  }

  if (status === "rejected" && artistRequest?.cooldownEndsAt) {
    return (
      <Card className="border-red-500/20 bg-red-500/5">
        <div className="flex items-start gap-3">
          <FaTimesCircle className="mt-1 text-2xl text-red-300" aria-hidden="true" />
          <div>
            <h2 className="font-bold text-white">Artist application not approved</h2>
            {artistRequest.rejectionReason && <p className="mt-1 text-sm text-gray-300">Reason: {artistRequest.rejectionReason}</p>}
            <p className="mt-1 text-sm text-gray-400">You can apply again on {formatDate(artistRequest.cooldownEndsAt)}.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-fuchsia-500/20 bg-linear-to-r from-violet-600/15 to-fuchsia-600/10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <FaStar className="text-2xl text-fuchsia-300" style={{ animation: "crownFloat 3s ease-in-out infinite" }} aria-hidden="true" />
          <div>
            <h2 className="font-bold text-white">{user?.artistIntent ? "Finish your artist application" : "Make music? Become an artist"}</h2>
            <p className="text-sm text-gray-400">Apply once. After admin approval you can switch between listening and your Artist Studio.</p>
          </div>
        </div>
        <Link to="/listener/become-artist" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-semibold text-white hover:brightness-110">
          Apply now
        </Link>
      </div>
    </Card>
  );
}
