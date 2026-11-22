import { Link } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";
import AuthCard from "../components/AuthCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import { getDashboardChildPath, getDashboardPath } from "../routes/routePaths.js";

export const PaymentCancel = () => {
  usePageTitle("Payment cancelled");
  const { activeRole } = useAuth();
  return (
    <AuthCard title="Payment cancelled">
      <div className="flex flex-col items-center text-center">
        <FaTimesCircle className="text-5xl text-gray-400" aria-hidden="true" />
        <p className="mt-4 text-sm text-gray-300">No charge was made and your plan has not changed.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to={getDashboardPath(activeRole)} className="inline-flex min-h-11 items-center rounded-xl border border-violet-500/30 px-5 font-semibold text-gray-200 hover:bg-violet-500/10">
            Back to Sonora
          </Link>
          <Link to={getDashboardChildPath(activeRole, "pricing")} className="inline-flex min-h-11 items-center rounded-xl bg-linear-to-r from-violet-600 to-fuchsia-600 px-5 font-semibold text-white hover:opacity-90">
            Try again
          </Link>
        </div>
      </div>
    </AuthCard>
  );
};

export default PaymentCancel;
