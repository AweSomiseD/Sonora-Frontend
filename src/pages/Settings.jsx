import { useState } from "react";
import {
  FaEnvelope,
  FaCheckCircle,
  FaExclamationTriangle,
  FaKey,
  FaGoogle,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import api from "../services/api.js";

export const Settings = () => {
  const { user } = useAuth();

  const [resendStatus, setResendStatus] = useState("");
  const [resending, setResending] = useState(false);

  const [resetStatus, setResetStatus] = useState("");
  const [resetting, setResetting] = useState(false);

  const isGoogleAccount = user?.authProvider === "google";

  const handleResendVerification = async () => {
    setResending(true);
    setResendStatus("");

    try {
      const response = await api.post("/auth/resend-verification", {
        email: user.email,
      });
      setResendStatus(response.data?.message || "Verification email sent.");
    } catch (error) {
      setResendStatus(
        error.response?.data?.message || "Failed to send verification email.",
      );
    } finally {
      setResending(false);
    }
  };

  const handleChangePassword = async () => {
    setResetting(true);
    setResetStatus("");

    try {
      const response = await api.post("/auth/forgot-password", {
        email: user.email,
      });
      setResetStatus(
        response.data?.message || "Password reset link sent to your email.",
      );
    } catch (error) {
      setResetStatus(
        error.response?.data?.message || "Failed to send reset link.",
      );
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="px-8 py-10">
      <p className="text-sm font-medium text-amber-500">Preferences</p>
      <h1 className="mt-1 text-3xl font-bold">Settings</h1>

      <div className="mt-8 max-w-lg space-y-5">
        {/* Email Verification */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <div className="flex items-center gap-3">
            <FaEnvelope className="text-gray-500" />
            <h2 className="font-semibold">Email Verification</h2>
          </div>

          <p className="mt-2 text-sm text-gray-400">{user?.email}</p>

          <div className="mt-4">
            {user?.emailVerified ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1.5 text-sm font-semibold text-green-400">
                <FaCheckCircle />
                Verified
              </span>
            ) : (
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1.5 text-sm font-semibold text-amber-400">
                  <FaExclamationTriangle />
                  Not Verified
                </span>

                <button
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="mt-3 block rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold transition hover:border-amber-500 hover:text-amber-500 disabled:opacity-50"
                >
                  {resending ? "Sending..." : "Resend Verification Email"}
                </button>

                {resendStatus && (
                  <p className="mt-2 text-sm text-gray-400">{resendStatus}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Password */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <div className="flex items-center gap-3">
            <FaKey className="text-gray-500" />
            <h2 className="font-semibold">Password</h2>
          </div>

          {isGoogleAccount ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-gray-400">
              <FaGoogle className="text-gray-500" />
              You signed up with Google — password changes aren't applicable.
            </p>
          ) : (
            <>
              <p className="mt-2 text-sm text-gray-400">
                We'll email you a link to reset your password.
              </p>

              <button
                onClick={handleChangePassword}
                disabled={resetting}
                className="mt-3 rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold transition hover:border-amber-500 hover:text-amber-500 disabled:opacity-50"
              >
                {resetting ? "Sending..." : "Send Password Reset Link"}
              </button>

              {resetStatus && (
                <p className="mt-2 text-sm text-gray-400">{resetStatus}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
