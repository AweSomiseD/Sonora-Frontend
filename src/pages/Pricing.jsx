import { FaCheck, FaCrown } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import api from "../services/api.js";

export const Pricing = () => {
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleSubscribe = async (plan) => {
    try {
      setLoadingPlan(plan);

      const response = await api.post("/payments/create-checkout-session", {
        plan,
      });

      window.location.href = response.data.url;
    } catch (error) {
      console.error("Checkout error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to start checkout. Please try again.",
      );
    } finally {
      setLoadingPlan(null);
    }
  };
  const { user } = useAuth();

  const plans = [
    {
      name: "Starter",
      price: "$0",
      period: "forever",
      description: "Everything you need to enjoy Spotify Clone.",
      features: [
        "Music streaming",
        "Likes & Library",
        "Follow artists",
        "Recently played",
        "Real-time messaging",
      ],
      current: user?.subscriptionPlan === "free",
    },
    {
      name: "Monthly",
      price: "$5",
      period: "month",
      description: "Unlock premium features with monthly billing.",
      features: [
        "Everything in Starter",
        "Premium verified badge",
        "Premium profile styling",
        "Advanced playlist features",
        "Premium feature access",
      ],
      current: user?.subscriptionPlan === "monthly",
    },
    {
      name: "Yearly",
      price: "$40",
      period: "year",
      description: "Premium access with yearly billing.",
      features: [
        "Everything in Starter",
        "Premium verified badge",
        "Premium profile styling",
        "Advanced playlist features",
        "Premium feature access",
      ],
      current: user?.subscriptionPlan === "yearly",
      highlight: true, // Yearly = best value
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Keyframes */}
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardGlow {
          0%, 100% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.15); }
          50% { box-shadow: 0 0 60px rgba(139, 92, 246, 0.28); }
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 10px rgba(139, 92, 246, 0.5); }
          50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.8); }
        }
        @keyframes crownFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 animate-pulse rounded-full bg-violet-500/12 blur-[120px]" />
        <div
          className="absolute -right-40 bottom-20 h-96 w-96 animate-pulse rounded-full bg-fuchsia-600/10 blur-[120px]"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      <div className="relative z-10 px-8 py-12">
        <div className="mx-auto max-w-6xl animate-fade-in-up">
          {/* Header */}
          <div className="text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/5 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-violet-400 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
              </span>
              <FaCrown className="text-xs" />
              Choose Your Plan
            </p>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              <span className="bg-linear-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Simple pricing.{" "}
              </span>
              <br className="sm:hidden" />
              <span
                className="bg-linear-to-r from-violet-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent"
                style={{
                  backgroundSize: "200% auto",
                  animation: "gradientShift 4s ease infinite",
                }}
              >
                Premium experience.
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
              Choose the plan that fits the way you use Sonora.
            </p>
          </div>

          {/* Plans */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const isHighlight = plan.highlight && !plan.current;
              const isLoading =
                (loadingPlan === "monthly" && plan.name === "Monthly") ||
                (loadingPlan === "yearly" && plan.name === "Yearly");

              return (
                <div
                  key={plan.name}
                  className={`group relative overflow-hidden rounded-3xl transition-all duration-500 ${
                    isHighlight ? "md:-translate-y-3" : "hover:-translate-y-1"
                  }`}
                >
                  {/* Highlight gradient border wrapper for Yearly */}
                  {isHighlight ? (
                    <div
                      className="absolute inset-0 rounded-3xl bg-linear-to-r from-violet-500 via-fuchsia-500 to-purple-500 p-[1.5px]"
                      style={{
                        backgroundSize: "200% 200%",
                        animation: "gradientShift 5s ease infinite",
                      }}
                    >
                      <div className="h-full w-full rounded-[calc(1.5rem-1.5px)] bg-gray-900/95" />
                    </div>
                  ) : (
                    <div
                      className={`absolute inset-0 rounded-3xl border transition-colors duration-500 ${
                        plan.current
                          ? "border-violet-500/50 bg-violet-500/5"
                          : "border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 group-hover:border-violet-500/30"
                      }`}
                    />
                  )}

                  {/* Corner glow orb */}
                  <div
                    className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl transition-all duration-500 ${
                      isHighlight
                        ? "bg-fuchsia-500/25 group-hover:bg-fuchsia-500/40"
                        : plan.current
                          ? "bg-violet-500/20 group-hover:bg-violet-500/35"
                          : "bg-violet-500/10 group-hover:bg-violet-500/25"
                    }`}
                  />

                  <div className="relative p-7 backdrop-blur-sm">
                    {/* Current plan badge */}
                    {plan.current && (
                      <span
                        className="absolute right-6 top-6 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300 backdrop-blur-sm"
                        style={{
                          animation: "badgePulse 2.5s ease-in-out infinite",
                        }}
                      >
                        Current Plan
                      </span>
                    )}

                    {/* Best Value badge for Yearly */}
                    {isHighlight && (
                      <span className="absolute right-6 top-6 rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 px-3 py-1 text-xs font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.6)]">
                        Best Value
                      </span>
                    )}

                    {/* Crown icon */}
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-500 group-hover:scale-110 ${
                        isHighlight
                          ? "bg-linear-to-br from-violet-500/30 to-fuchsia-500/20 text-violet-300 shadow-[0_0_25px_rgba(139,92,246,0.4)]"
                          : plan.current
                            ? "bg-linear-to-br from-violet-500/25 to-fuchsia-500/15 text-violet-300"
                            : "bg-linear-to-br from-violet-500/15 to-fuchsia-500/10 text-violet-400"
                      }`}
                      style={
                        isHighlight
                          ? { animation: "crownFloat 3s ease-in-out infinite" }
                          : undefined
                      }
                    >
                      <FaCrown className="text-lg" />
                    </div>

                    {/* Name */}
                    <h2 className="mt-6 text-2xl font-bold">{plan.name}</h2>

                    {/* Description */}
                    <p className="mt-2 min-h-12 text-sm leading-relaxed text-gray-400">
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div className="mt-6 flex items-end gap-2">
                      <span
                        className={`text-5xl font-black tracking-tight ${
                          isHighlight
                            ? "bg-linear-to-r from-violet-300 via-fuchsia-300 to-purple-300 bg-clip-text text-transparent"
                            : "text-white"
                        }`}
                      >
                        {plan.price}
                      </span>
                      <span className="mb-2 text-sm text-gray-500">
                        / {plan.period}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="my-6 h-px bg-linear-to-r from-transparent via-violet-500/30 to-transparent" />

                    {/* Features */}
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-3 text-sm text-gray-300"
                        >
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                              isHighlight
                                ? "bg-violet-500/20 text-violet-300"
                                : "bg-violet-500/10 text-violet-400"
                            }`}
                          >
                            <FaCheck className="text-[10px]" />
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Button */}
                    <button
                      onClick={() => {
                        if (plan.name === "Monthly") {
                          handleSubscribe("monthly");
                        }

                        if (plan.name === "Yearly") {
                          handleSubscribe("yearly");
                        }
                      }}
                      disabled={
                        plan.current ||
                        plan.name === "Starter" ||
                        loadingPlan !== null
                      }
                      className={`group/btn relative mt-8 w-full overflow-hidden rounded-xl px-4 py-3.5 text-sm font-bold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
                        isHighlight
                          ? "bg-linear-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(139,92,246,0.7)] disabled:hover:scale-100"
                          : plan.current
                            ? "border border-violet-500/30 bg-violet-500/10 text-violet-300"
                            : plan.name === "Starter"
                              ? "border border-gray-700/50 bg-gray-900/50 text-gray-300"
                              : "bg-linear-to-r from-violet-500/80 to-fuchsia-500/80 text-white hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]"
                      }`}
                    >
                      {/* Shimmer for primary buttons */}
                      {(isHighlight ||
                        (!plan.current && plan.name !== "Starter")) && (
                        <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                      )}
                      <span className="relative">
                        {isLoading
                          ? "Redirecting..."
                          : plan.current
                            ? "Current Plan"
                            : plan.name === "Starter"
                              ? "Free Plan"
                              : `Choose ${plan.name}`}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <p className="mt-10 text-center text-sm text-gray-500">
            All plans include unlimited streaming. Upgrade or cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
};
