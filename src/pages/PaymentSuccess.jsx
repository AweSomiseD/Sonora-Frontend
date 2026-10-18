import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const PaymentSuccess = () => {
  const { user, fetchCurrentUser } = useAuth();

  useEffect(() => {
    fetchCurrentUser(true);
  }, []);

  const isPremium = user?.subscriptionStatus === "premium";

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {isPremium ? (
          <>
            <div className="mb-6 text-6xl">🎉</div>

            <h1 className="text-3xl font-bold mb-3">Payment Successful!</h1>

            <p className="text-gray-400 mb-2">
              Welcome back, {user?.username}!
            </p>

            <p className="text-purple-400 font-medium mb-8">
              ✓ Premium subscription is now active.
            </p>

            <Link
              to="/listener"
              className="inline-block rounded-lg bg-purple-600 px-6 py-3 font-medium transition hover:bg-purple-700"
            >
              Continue to Spotify
            </Link>
          </>
        ) : (
          <>
            <div className="mb-6 text-6xl">⏳</div>

            <h1 className="text-3xl font-bold mb-3">Payment Processing</h1>

            <p className="text-gray-400 mb-8">
              Your payment was received, but your Premium subscription is still
              being activated. Please refresh the page in a moment.
            </p>

            <Link
              to="/listener"
              className="inline-block rounded-lg border border-gray-700 px-6 py-3 font-medium transition hover:bg-gray-800"
            >
              Back to Spotify
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
