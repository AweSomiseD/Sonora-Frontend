import { Link } from "react-router-dom";

export const PaymentCancel = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 text-6xl">😕</div>

        <h1 className="text-3xl font-bold mb-3">Payment Cancelled</h1>

        <p className="text-gray-400 mb-8">
          Your payment was cancelled and your subscription was not activated.
        </p>

        <div className="flex justify-center gap-3">
          <Link
            to="/listener"
            className="rounded-lg border border-gray-700 px-5 py-3 font-medium transition hover:bg-gray-800"
          >
            Back to Spotify
          </Link>

          <Link
            to="/listener"
            className="rounded-lg bg-purple-600 px-5 py-3 font-medium transition hover:bg-purple-700"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
};
