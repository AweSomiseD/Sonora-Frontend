import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaClock, FaCrown } from "react-icons/fa";
import AuthCard from "../components/AuthCard.jsx";
import { Spinner } from "../components/ui/index.jsx";
import { useAuth } from "../context/AuthContext";
import usePageTitle from "../hooks/usePageTitle.js";
import api from "../services/api.js";
import { getDashboardPath } from "../routes/routePaths.js";
import { formatDate } from "../utils/format.js";

// Verifies the Stripe session right away (no waiting for the webhook)
export const PaymentSuccess = () => {
  usePageTitle("Payment received");
  const { activeRole, refreshUser } = useAuth();
  const [params] = useSearchParams();
  const [state, setState] = useState({ status: "checking" });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const sessionId = params.get("session_id");

    const check = async (attempt = 0) => {
      try {
        const { data } = sessionId ? await api.get(`/payments/checkout-session/${encodeURIComponent(sessionId)}`) : await api.get("/payments/status");
        if (data.isPremium) {
          setState({ status: "active", data });
          refreshUser();
        } else if (attempt < 5) {
          setTimeout(() => check(attempt + 1), 2000);
        } else {
          setState({ status: "pending" });
        }
      } catch {
        if (attempt < 3) setTimeout(() => check(attempt + 1), 2000);
        else setState({ status: "pending" });
      }
    };
    check();
  }, [params, refreshUser]);

  return (
    <AuthCard
      title={state.status === "active" ? "Welcome to Premium!" : state.status === "pending" ? "Payment received" : "Confirming your payment..."}
      footer={<Link to={getDashboardPath(activeRole)} className="font-semibold text-violet-300 hover:underline">Go to your dashboard</Link>}
    >
      <div className="flex flex-col items-center text-center" role="status">
        {state.status === "checking" && <Spinner className="text-3xl" />}
        {state.status === "active" && (
          <>
            <FaCheckCircle className="text-5xl text-emerald-400" aria-hidden="true" />
            <p className="mt-4 flex items-center gap-2 text-sm text-gray-200">
              <FaCrown className="text-amber-300" aria-hidden="true" /> Premium {state.data.plan} is active
              {state.data.currentPeriodEnd ? ` until ${formatDate(state.data.currentPeriodEnd)}` : ""}.
            </p>
          </>
        )}
        {state.status === "pending" && (
          <>
            <FaClock className="text-5xl text-amber-300" aria-hidden="true" />
            <p className="mt-4 text-sm text-gray-300">Your payment went through, but Premium is still being activated. It usually takes a few seconds. Refresh this page in a moment.</p>
          </>
        )}
      </div>
    </AuthCard>
  );
};

export default PaymentSuccess;
