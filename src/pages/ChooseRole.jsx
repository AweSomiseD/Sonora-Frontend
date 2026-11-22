import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard.jsx";
import { Button } from "../components/ui/index.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import api, { getErrorMessage } from "../services/api.js";

// Finish Google sign-up. Everyone starts as a listener; artists apply later
// and an admin approves them. (The URL /choose-role is kept for old links.)
const ChooseRole = () => {
  usePageTitle("Finish sign up");
  const { fetchCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState(null);
  const [wantsToBeArtist, setWantsToBeArtist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/auth/google/pending", { skipAuthRefresh: true })
      .then(({ data }) => setPending(data))
      .catch((err) => setError(getErrorMessage(err, "Your Google sign-up session expired. Please try again.")));
  }, []);

  const handleContinue = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/google/complete", { wantsToBeArtist }, { skipAuthRefresh: true });
      await fetchCurrentUser();
      navigate(wantsToBeArtist ? "/listener/become-artist" : "/listener", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Google registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Almost done"
      subtitle={pending ? `Creating your Sonora account for ${pending.email}` : "Finish creating your account"}
      footer={<Link to="/login" className="font-semibold text-violet-300 hover:underline">Back to login</Link>}
    >
      {error && (
        <p role="alert" className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </p>
      )}
      {pending && (
        <div className="space-y-5">
          <p className="text-sm text-gray-300">Your account starts as a <b className="text-white">listener</b>: discover music, make playlists and follow artists.</p>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 text-sm text-gray-300">
            <input type="checkbox" checked={wantsToBeArtist} onChange={(e) => setWantsToBeArtist(e.target.checked)} className="mt-0.5 h-4 w-4 cursor-pointer accent-violet-500" />
            <span>
              I also want to apply as an artist
              <span className="block text-xs text-gray-500">You will fill a short application next. An admin approves it.</span>
            </span>
          </label>
          <Button className="w-full" size="lg" loading={loading} onClick={handleContinue}>
            Continue
          </Button>
        </div>
      )}
    </AuthCard>
  );
};

export default ChooseRole;
