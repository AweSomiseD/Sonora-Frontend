import { useEffect, useState } from "react";
import { FaCheck, FaCrown, FaExclamationTriangle } from "react-icons/fa";
import { Badge, Button, Card, PageHeader, Skeleton } from "../components/ui/index.jsx";
import { PLAN_LIMITS } from "../constants/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import api, { getErrorMessage } from "../services/api.js";
import { formatDate } from "../utils/format.js";

const unlimited = (value, unit) => (value === null ? `Unlimited ${unit}` : `${value} ${unit}`);

export const Pricing = () => {
  usePageTitle("Premium");
  const { activeRole } = useAuth();
  const { showToast } = useToast();
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    api
      .get("/payments/status")
      .then(({ data }) => setStatus(data))
      .catch(() => setStatus({ plan: "free", status: "free", isPremium: false }));
  }, []);

  const redirect = async (path, body, label) => {
    setBusy(label);
    try {
      const { data } = await api.post(path, body);
      window.location.href = data.url;
    } catch (error) {
      showToast(getErrorMessage(error, "Payments are not available right now"), "error");
      setBusy("");
    }
  };

  const listenerFree = PLAN_LIMITS.listener.free;
  const listenerPremium = PLAN_LIMITS.listener.premium;
  const artistFree = PLAN_LIMITS.artist.free;

  const features = {
    free: [
      unlimited(listenerFree.maxPlaylists, "playlists"),
      `${listenerFree.skipsPerHour} skips per hour`,
      `Artists: ${artistFree.maxPublishedTracks} published tracks`,
      `Artists: ${artistFree.analyticsMaxRangeDays}-day analytics`,
    ],
    premium: [
      unlimited(listenerPremium.maxPlaylists, "playlists"),
      "Unlimited skips",
      "Artists: unlimited tracks",
      "Artists: 30 & 90 day analytics + per-track stats",
      "Premium badge",
    ],
  };

  const isPremium = status?.isPremium;
  const plans = [
    { id: "monthly", name: "Premium Monthly", price: "Monthly", note: "Cancel anytime" },
    { id: "yearly", name: "Premium Yearly", price: "Yearly", note: "Best value" },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Premium" subtitle={activeRole === "artist" ? "Grow your audience with full analytics and unlimited uploads" : "Listen without limits"} icon={FaCrown} />

      {!status ? (
        <Skeleton className="mb-6 h-24 w-full" />
      ) : (
        <Card className={`mb-8 ${isPremium ? "border-amber-500/30 bg-amber-500/5" : ""}`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-400">Your current plan</p>
              <p className="flex items-center gap-2 text-2xl font-black text-white">
                {isPremium ? "Premium" : "Free"} {isPremium && <Badge tone="yellow">{status.plan}</Badge>}
              </p>
              {status.status === "past_due" && (
                <p className="mt-1 flex items-center gap-2 text-sm text-amber-300">
                  <FaExclamationTriangle aria-hidden="true" /> Your last payment failed. Update your card to keep Premium.
                </p>
              )}
              {isPremium && status.currentPeriodEnd && (
                <p className="mt-1 text-sm text-gray-400">
                  {status.cancelAtPeriodEnd ? "Ends on" : "Renews on"} {formatDate(status.currentPeriodEnd)}
                </p>
              )}
            </div>
            {status.hasCustomer && (
              <Button variant="secondary" loading={busy === "portal"} onClick={() => redirect("/payments/portal", {}, "portal")}>
                Manage subscription
              </Button>
            )}
          </div>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <h2 className="text-lg font-bold text-white">Free</h2>
          <p className="mt-1 text-sm text-gray-400">Everything you need to start</p>
          <ul className="mt-5 space-y-2 text-sm text-gray-300">
            {features.free.map((f) => (
              <li key={f} className="flex items-start gap-2"><FaCheck className="mt-1 shrink-0 text-gray-500" aria-hidden="true" /> {f}</li>
            ))}
          </ul>
          {!isPremium && <Badge tone="gray" className="mt-6">Current plan</Badge>}
        </Card>
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative border-fuchsia-500/30 ${plan.id === "yearly" ? "shadow-[0_0_40px_rgba(217,70,239,0.15)]" : ""}`}>
            {plan.id === "yearly" && <Badge tone="fuchsia" className="absolute right-4 top-4">{plan.note}</Badge>}
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <FaCrown className="text-amber-300" aria-hidden="true" /> {plan.name}
            </h2>
            <p className="mt-1 text-sm text-gray-400">Billed {plan.price.toLowerCase()} through Stripe. {plan.id === "monthly" ? plan.note : ""}</p>
            <ul className="mt-5 space-y-2 text-sm text-gray-200">
              {features.premium.map((f) => (
                <li key={f} className="flex items-start gap-2"><FaCheck className="mt-1 shrink-0 text-fuchsia-400" aria-hidden="true" /> {f}</li>
              ))}
            </ul>
            <Button
              className="mt-6 w-full"
              loading={busy === plan.id}
              disabled={Boolean(busy)}
              onClick={() => (isPremium ? redirect("/payments/portal", {}, plan.id) : redirect("/payments/create-checkout-session", { plan: plan.id }, plan.id))}
            >
              {isPremium ? (status?.plan === plan.id ? "Manage plan" : "Switch in billing portal") : "Get Premium"}
            </Button>
          </Card>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-gray-500">Payments are processed securely by Stripe. Prices are shown on the Stripe checkout page.</p>
    </div>
  );
};

export default Pricing;
