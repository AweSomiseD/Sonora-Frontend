import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { PASSWORD_RULES, isStrongPassword } from "../constants/index.js";
import usePageTitle from "../hooks/usePageTitle.js";
import { PasswordInput } from "../components/ui/index.jsx";
import {
  FaMusic,
  FaCompactDisc,
  FaUsers,
  FaUpload,
  FaRocket,
} from "react-icons/fa";

const USERNAME_RULE = /^[a-zA-Z0-9_.]{3,30}$/;

export const Register = () => {
  usePageTitle("Create account");
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Optional: apply as an artist after verifying the email (admin approval needed)
  const [wantsToBeArtist, setWantsToBeArtist] = useState(false);
  const [registerErrors, setRegisterErrors] = useState({});
  const [isRegistering, setIsRegistering] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const fieldError = (fieldName, value) => {
    if (fieldName === "username") {
      if (!value.trim()) return "Username is required";
      if (!USERNAME_RULE.test(value.trim())) return "3-30 characters: letters, numbers, _ and . only";
    }
    if (fieldName === "email") {
      if (!value.trim()) return "Email is required";
      if (!/^\S+@\S+\.\S+$/.test(value.trim())) return "Email is invalid";
    }
    if (fieldName === "password") {
      if (!value) return "Password is required";
      if (!isStrongPassword(value)) return "Password does not meet the requirements below";
    }
    return null;
  };

  const validateRegisterField = (fieldName, value) => {
    const newErrors = { ...registerErrors };
    const message = value ? fieldError(fieldName, value) : null;
    if (message) newErrors[fieldName] = message;
    else delete newErrors[fieldName];
    setRegisterErrors(newErrors);
  };

  const validateRegister = () => {
    const newErrors = {};
    for (const [name, value] of [["username", username], ["email", email], ["password", password]]) {
      const message = fieldError(name, value);
      if (message) newErrors[name] = message;
    }
    setRegisterErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;

    setIsRegistering(true);
    const result = await register(username.trim(), email.trim(), password, wantsToBeArtist);
    setIsRegistering(false);

    if (result.success) {
      setRegisteredEmail(email.trim());
      showToast("Account created! Please verify your email.", "success");
      return;
    }

    // Show server validation errors next to the right field
    const serverErrors = {};
    (result.errors || []).forEach((err) => {
      if (["username", "email", "password"].includes(err.path)) serverErrors[err.path] = err.message;
    });
    if (result.code === "USER_EXISTS") {
      serverErrors[result.message.toLowerCase().includes("username") ? "username" : "email"] = result.message;
    }
    setRegisterErrors(serverErrors);
    showToast(result.message || "Registration failed.", "error");
  };

  const passwordChecks = PASSWORD_RULES.map((rule) => ({ label: rule.label, valid: rule.test(password) }));

  // Benefits for brand panel
  const benefits = [
    { icon: FaMusic, text: "Discover tracks from independent artists" },
    {
      icon: FaCompactDisc,
      text: "Explore albums organized by independent creators",
    },
    { icon: FaUpload, text: "Apply as an artist to upload your own music" },
    { icon: FaUsers, text: "Join a growing community of listeners & creators" },
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-950 p-4">
      {/* ========================================
          Animated Background Textures
      ======================================== */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 animate-pulse rounded-full bg-violet-500/20 blur-[120px]" />
        <div
          className="absolute -right-40 top-1/3 h-96 w-96 animate-pulse rounded-full bg-fuchsia-600/15 blur-[120px]"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute -bottom-40 left-1/3 h-96 w-96 animate-pulse rounded-full bg-purple-400/15 blur-[120px]"
          style={{ animationDelay: "2s" }}
        />

        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139,92,246,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.6) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            animation: "gridMove 20s linear infinite",
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>


      {/* ========================================
          Main Container — Two Column Layout
      ======================================== */}
      <div className="relative z-10 grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2">
        {/* ========================================
            LEFT — Brand Showcase Panel
        ======================================== */}
        <div className="hidden animate-fade-in-left lg:block">
          {/* Logo + Brand */}
          <div className="flex items-center gap-3">
            <span
              className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 to-fuchsia-500 text-xl font-black text-white shadow-[0_0_25px_rgba(139,92,246,0.6)]"
              style={{ animation: "floatSlow 4s ease-in-out infinite" }}
            >
              S
            </span>
            <div>
              <h2 className="text-2xl font-black tracking-tight">
                <span
                  className="bg-linear-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-transparent"
                  style={{
                    backgroundSize: "200% auto",
                    animation: "gradientShift 4s ease infinite",
                  }}
                >
                  Sonora
                </span>
              </h2>
              <p className="text-xs uppercase tracking-[0.25em] text-violet-400">
                Music Platform
              </p>
            </div>
          </div>

          {/* Heading */}
          <h1 className="mt-10 text-5xl font-black leading-[1.05] tracking-tight">
            <span className="bg-linear-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Join the
            </span>
            <br />
            <span
              className="bg-linear-to-r from-violet-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent"
              style={{
                backgroundSize: "200% auto",
                animation: "gradientShift 4s ease infinite",
              }}
            >
              Sonora family.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-md text-lg leading-8 text-gray-400">
            Create your free account and unlock a world of music — whether
            you're here to discover new tracks or share your own creations with
            the world.
          </p>

          {/* Benefits */}
          <ul className="mt-8 space-y-3">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <li
                  key={idx}
                  className="flex items-center gap-3 text-sm text-gray-300"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-violet-500/25 to-fuchsia-500/10 text-violet-400">
                    <Icon className="text-sm" />
                  </span>
                  <span>{benefit.text}</span>
                </li>
              );
            })}
          </ul>

          {/* Decorative visual — stacked discs */}
          <div className="relative mt-10 flex h-32 w-32 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-linear-to-br from-violet-500/30 via-fuchsia-500/20 to-transparent blur-2xl" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-violet-500/30 bg-gray-900/60 backdrop-blur-sm">
              <div
                className="absolute inset-0 rounded-full border border-violet-500/20"
                style={{ animation: "spinSlow 16s linear infinite" }}
              >
                <div className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.9)]" />
              </div>
              <FaRocket className="text-2xl text-violet-300" />
            </div>
          </div>
        </div>

        {/* ========================================
            RIGHT — Register Card
        ======================================== */}
        <div className="relative w-full max-w-lg animate-fade-in-up lg:mx-auto">
          {/* Glow behind card */}
          <div className="absolute -inset-2 rounded-3xl bg-linear-to-r from-violet-500/20 via-fuchsia-500/20 to-purple-500/20 blur-2xl" />

          {/* Card with animated gradient border */}
          <div className="relative overflow-hidden rounded-2xl p-[1.5px]">
            <div
              className="absolute inset-0 rounded-2xl bg-linear-to-r from-violet-500/50 via-fuchsia-500/50 to-purple-500/50"
              style={{
                backgroundSize: "200% 200%",
                animation: "gradientShift 6s ease infinite",
              }}
            />

            <div
              className="relative rounded-[calc(1rem-1.5px)] border border-white/5 bg-gray-900/80 p-8 backdrop-blur-xl"
              style={{ animation: "cardGlow 4s ease-in-out infinite" }}
            >
              {/* Inner decorative glow orbs */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl" />
                <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl" />
              </div>

              <div className="relative">
                {/* Mobile-only brand badge */}
                <div className="mb-6 flex items-center justify-center gap-2 lg:hidden">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
                    S
                  </span>
                  <span className="text-lg font-black text-white">Sonora</span>
                </div>

                {/* Header */}
                <div className="mb-6 text-center">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
                    Start your journey
                  </p>
                  <h1 className="text-4xl font-black tracking-tight">
                    <span
                      className="bg-linear-to-r from-violet-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent"
                      style={{
                        backgroundSize: "200% auto",
                        animation: "gradientShift 4s ease infinite",
                      }}
                    >
                      Create Account
                    </span>
                  </h1>

                  <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-linear-to-r from-violet-500 via-fuchsia-500 to-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.6)]" />
                </div>

                {registeredEmail ? (
                  <div role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
                    <p className="text-lg font-bold text-white">Check your email</p>
                    <p className="mt-2 text-sm text-gray-300">
                      We sent a verification link to <b className="text-white">{registeredEmail}</b>. Open it, then log in.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate("/login", { replace: true })}
                      className="mt-4 min-h-10 cursor-pointer rounded-xl bg-linear-to-r from-violet-500 to-fuchsia-500 px-5 text-sm font-semibold text-white"
                    >
                      Go to login
                    </button>
                  </div>
                ) : (
                <form className="flex flex-col gap-3" onSubmit={handleRegister} noValidate>
                  {/* Username */}
                  <div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        validateRegisterField("username", e.target.value);
                      }}
                      placeholder="Username"
                      aria-label="Username"
                      autoComplete="username"
                      disabled={isRegistering}
                      className={`w-full rounded-xl border bg-gray-950/60 px-4 py-3 text-white outline-none transition-all duration-200 placeholder-gray-500 focus:ring-4 disabled:opacity-50 ${
                        registerErrors.username
                          ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-700/50 focus:border-violet-500/60 focus:ring-violet-500/20"
                      }`}
                    />

                    {registerErrors.username && (
                      <p className="ml-1 mt-1.5 text-sm text-red-400">
                        {registerErrors.username}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        validateRegisterField("email", e.target.value);
                      }}
                      placeholder="Email"
                      aria-label="Email"
                      autoComplete="email"
                      disabled={isRegistering}
                      className={`w-full rounded-xl border bg-gray-950/60 px-4 py-3 text-white outline-none transition-all duration-200 placeholder-gray-500 focus:ring-4 disabled:opacity-50 ${
                        registerErrors.email
                          ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-700/50 focus:border-violet-500/60 focus:ring-violet-500/20"
                      }`}
                    />

                    {registerErrors.email && (
                      <p className="ml-1 mt-1.5 text-sm text-red-400">
                        {registerErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <PasswordInput
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        validateRegisterField("password", e.target.value);
                      }}
                      placeholder="Password"
                      aria-label="Password"
                      autoComplete="new-password"
                      disabled={isRegistering}
                      className={`w-full rounded-xl border bg-gray-950/60 px-4 py-3 text-white outline-none transition-all duration-200 placeholder-gray-500 focus:ring-4 disabled:opacity-50 ${
                        registerErrors.password
                          ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-700/50 focus:border-violet-500/60 focus:ring-violet-500/20"
                      }`}
                    />

                    {registerErrors.password && (
                      <p className="ml-1 mt-1.5 text-sm text-red-400">
                        {registerErrors.password}
                      </p>
                    )}
                  </div>

                  {/* Optional artist application (admin approval required) */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={wantsToBeArtist}
                      onChange={(e) => setWantsToBeArtist(e.target.checked)}
                      disabled={isRegistering}
                      className="mt-0.5 h-4 w-4 cursor-pointer accent-violet-500"
                    />
                    <span>
                      I also want to apply as an artist
                      <span className="block text-xs text-gray-500">Everyone starts as a listener. After you verify your email you can send an artist application; an admin approves it.</span>
                    </span>
                  </label>

                  {/* Password Requirements */}
                  <div className="mt-1 space-y-1.5 rounded-xl border border-gray-800/50 bg-gray-950/40 p-3 text-sm backdrop-blur-sm">
                    {passwordChecks.map((check, index) => (
                      <p
                        key={index}
                        className={`flex items-center gap-2 transition-colors duration-300 ${
                          check.valid ? "text-violet-300" : "text-gray-500"
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] transition-all duration-300 ${
                            check.valid
                              ? "bg-violet-500 text-white shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                              : "bg-gray-800 text-gray-500"
                          }`}
                        >
                          {check.valid ? "✓" : "○"}
                        </span>
                        {check.label}
                      </p>
                    ))}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="group relative mt-1 w-full overflow-hidden rounded-xl bg-linear-to-r from-violet-500 to-fuchsia-500 px-4 py-3.5 font-semibold text-white shadow-lg shadow-violet-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] disabled:scale-100 disabled:opacity-50 disabled:shadow-none"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <span className="relative">
                      {isRegistering ? "Registering..." : "Register"}
                    </span>
                  </button>
                </form>
                )}

                <div className="mt-6 text-center text-sm text-gray-400">
                  <p>
                    Already have an account?{" "}
                    <NavLink
                      to="/login"
                      className="font-medium text-violet-400 transition-colors hover:text-violet-300 hover:underline"
                    >
                      Login here
                    </NavLink>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
