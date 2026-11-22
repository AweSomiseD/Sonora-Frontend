import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCrown } from "react-icons/fa";
import { Button, Modal } from "./ui/index.jsx";

const BENEFITS = {
  playlists: ["Unlimited playlists", "Unlimited skips", "Premium badge"],
  skips: ["Unlimited skips", "Unlimited playlists", "Premium badge"],
  tracks: ["Unlimited published tracks", "30 and 90 day analytics", "Per-track analytics"],
  analytics_range: ["30 and 90 day analytics", "Per-track analytics", "Unlimited published tracks"],
  track_analytics: ["Per-track analytics", "30 and 90 day analytics", "Unlimited published tracks"],
};

// Opens whenever the API answers { code: "PLAN_LIMIT" } (see services/interceptor.js)
export default function UpgradeModal() {
  const [limit, setLimit] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onLimit = (event) => setLimit(event.detail);
    window.addEventListener("plan:limit", onLimit);
    return () => window.removeEventListener("plan:limit", onLimit);
  }, []);

  const close = () => setLimit(null);
  const benefits = BENEFITS[limit?.feature] || BENEFITS.playlists;

  return (
    <Modal
      open={Boolean(limit)}
      onClose={close}
      title="You reached a free plan limit"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Not now
          </Button>
          <Button
            icon={FaCrown}
            onClick={() => {
              close();
              navigate(limit?.upgradeUrl || "/listener/pricing");
            }}
          >
            See Premium
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-300">{limit?.message}</p>
      <div className="mt-4 rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-fuchsia-300">Premium gives you</p>
        <ul className="space-y-1.5 text-sm text-gray-200">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2">
              <FaCrown className="text-amber-300" aria-hidden="true" /> {benefit}
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
