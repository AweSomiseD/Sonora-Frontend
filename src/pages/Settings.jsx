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
    <div className="relative min-h-screen overflow-hidden">
      {/* Keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-96 w-96 animate-pulse rounded-full bg-violet-500/10 blur-[120px]" />
        <div
          className="absolute -right-40 bottom-20 h-96 w-96 animate-pulse rounded-full bg-fuchsia-600/8 blur-[120px]"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      <div className="relative z-10 px-8 py-10 animate-fade-in-up">
        {/* Header */}
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
            </span>
            <FaKey className="text-[10px]" />
            Preferences
          </p>

          <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            <span className="bg-linear-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Settings
            </span>
          </h1>
        </div>

        <div className="mt-8 max-w-lg space-y-5">
          {/* Email Verification */}
          <div className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-6 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/30">
            {/* Corner glow */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl transition-all duration-500 group-hover:bg-violet-500/20" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-violet-500/20 to-fuchsia-500/10 text-violet-400 transition-all duration-300 group-hover:scale-105 group-hover:text-violet-300">
                  <FaEnvelope className="text-sm" />
                </span>
                <h2 className="font-semibold">Email Verification</h2>
              </div>

              <p className="mt-3 text-sm text-gray-400">{user?.email}</p>

              <div className="mt-4">
                {user?.emailVerified ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-sm font-semibold text-emerald-300 backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                    <FaCheckCircle className="text-xs" />
                    Verified
                  </span>
                ) : (
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-sm font-semibold text-amber-300 backdrop-blur-sm shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                      <FaExclamationTriangle className="text-xs" />
                      Not Verified
                    </span>

                    <button
                      onClick={handleResendVerification}
                      disabled={resending}
                      className="group/btn relative mt-4 block overflow-hidden rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-300 transition-all duration-300 hover:border-violet-500/50 hover:bg-violet-500/20 hover:text-violet-200 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="relative">
                        {resending ? "Sending..." : "Resend Verification Email"}
                      </span>
                    </button>

                    {resendStatus && (
                      <p className="mt-3 rounded-lg border border-gray-800/50 bg-gray-950/40 px-3 py-2 text-sm text-gray-300 backdrop-blur-sm">
                        {resendStatus}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="group relative overflow-hidden rounded-2xl border border-gray-800/50 bg-linear-to-b from-gray-900/80 to-gray-950/80 p-6 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/30">
            {/* Corner glow */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-fuchsia-500/10 blur-3xl transition-all duration-500 group-hover:bg-fuchsia-500/20" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-fuchsia-500/20 to-violet-500/10 text-fuchsia-400 transition-all duration-300 group-hover:scale-105 group-hover:text-fuchsia-300">
                  <FaKey className="text-sm" />
                </span>
                <h2 className="font-semibold">Password</h2>
              </div>

              {isGoogleAccount ? (
                <p className="mt-3 flex items-center gap-2 rounded-xl border border-gray-800/50 bg-gray-950/40 px-3 py-2.5 text-sm text-gray-300 backdrop-blur-sm">
                  <FaGoogle className="shrink-0 text-base text-red-400" />
                  You signed up with Google — password changes aren't
                  applicable.
                </p>
              ) : (
                <>
                  <p className="mt-3 text-sm text-gray-400">
                    We'll email you a link to reset your password.
                  </p>

                  <button
                    onClick={handleChangePassword}
                    disabled={resetting}
                    className="group/btn relative mt-4 overflow-hidden rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-300 transition-all duration-300 hover:border-violet-500/50 hover:bg-violet-500/20 hover:text-violet-200 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="relative">
                      {resetting ? "Sending..." : "Send Password Reset Link"}
                    </span>
                  </button>

                  {resetStatus && (
                    <p className="mt-3 rounded-lg border border-gray-800/50 bg-gray-950/40 px-3 py-2 text-sm text-gray-300 backdrop-blur-sm">
                      {resetStatus}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
