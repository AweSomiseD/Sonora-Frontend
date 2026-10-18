import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getDashboardPath } from "../routes/routePaths.js";
import {
  FaMusic,
  FaCompactDisc,
  FaHeadphones,
  FaUsers,
  FaUpload,
  FaRocket,
} from "react-icons/fa";

export const Register = () => {
  const { register, isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (window.location.pathname === "/register") {
        navigate(getDashboardPath(user?.role), { replace: true });
      }
    }
  }, [isAuthenticated, loading, navigate, user?.role]);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("listener");
  const [registerErrors, setRegisterErrors] = useState({});
  const [isRegistering, setIsRegistering] = useState(false);

  const [toast, setToast] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  const isPasswordValid = (value = "") => value && passwordRegex.test(value);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const showToastMessage = (message, type = "success") => {
    setToast({ message, type });
    setShowToast(true);
  };

  const clearRegisterForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setRole("listener");
    setRegisterErrors({});
  };

  const validateRegisterField = (fieldName, value) => {
    const newErrors = { ...registerErrors };

    switch (fieldName) {
      case "username":
        if (!value.trim()) newErrors.username = "Username is required";
        else delete newErrors.username;
        break;

      case "email":
        if (!value.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(value))
          newErrors.email = "Email is invalid";
        else delete newErrors.email;
        break;

      case "password":
        if (!value) delete newErrors.password;
        else if (!isPasswordValid(value))
          newErrors.password = "Password does not meet requirements";
        else delete newErrors.password;
        break;

      default:
        break;
    }

    setRegisterErrors(newErrors);
  };

  const validateRegister = () => {
    const newErrors = {};

    if (!username.trim()) newErrors.username = "Username is required";

    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";

    if (!password) newErrors.password = "Password is required";
    else if (!isPasswordValid(password))
      newErrors.password = "Password does not meet requirements";

    if (!role) newErrors.role = "Role is required";

    setRegisterErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateRegister()) {
      return;
    }

    setIsRegistering(true);

    try {
      const result = await register(username, email, password, role);

      if (result.success) {
        clearRegisterForm();
        showToastMessage("✅ Account registered successfully!", "success");

        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1500);
      } else {
        showToastMessage(
          `❌ ${result.message || "Registration failed."}`,
          "error",
        );
        setIsRegistering(false);
      }
    } catch (error) {
      console.error("Registration error:", error);
      showToastMessage(
        `❌ ${error.message || "Registration failed."}`,
        "error",
      );
      setIsRegistering(false);
    }
  };

  const roleOptions = [
    { value: "listener", label: "Listener" },
    { value: "artist", label: "Artist" },
  ];

  // Password requirement checks
  const passwordChecks = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "One lowercase letter", valid: /[a-z]/.test(password) },
    { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "One number", valid: /\d/.test(password) },
    { label: "One special character", valid: /[@$!%*?&]/.test(password) },
  ];

  // Benefits for brand panel
  const benefits = [
    { icon: FaMusic, text: "Discover thousands of tracks from new artists" },
    {
      icon: FaCompactDisc,
      text: "Explore albums organized by independent creators",
    },
    { icon: FaUpload, text: "Artists can upload and manage their own music" },
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

      {/* Keyframes */}
      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes cardGlow {
          0%, 100% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.15), 0 0 80px rgba(217, 70, 239, 0.08); }
          50% { box-shadow: 0 0 60px rgba(139, 92, 246, 0.25), 0 0 100px rgba(217, 70, 239, 0.12); }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.05); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .animate-fade-in-left {
          animation: fadeInLeft 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      {/* ========================================
          Toast
      ======================================== */}
      {showToast && toast && (
        <div
          className={`fixed right-6 top-6 z-50 transform transition-all duration-500 ${
            showToast
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          }`}
        >
          <div
            className={`flex min-w-[320px] max-w-md items-center gap-3 rounded-xl border-l-4 px-6 py-4 shadow-2xl backdrop-blur-md ${
              toast.type === "success"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-300 shadow-[0_10px_40px_rgba(16,185,129,0.25)]"
                : "border-red-500 bg-red-500/10 text-red-300 shadow-[0_10px_40px_rgba(239,68,68,0.25)]"
            }`}
          >
            <p className="font-semibold">{toast.message}</p>

            <button
              onClick={() => setShowToast(false)}
              className="ml-auto text-gray-400 transition-colors hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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

                <form className="flex flex-col gap-3" onSubmit={handleRegister}>
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
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        validateRegisterField("password", e.target.value);
                      }}
                      placeholder="Password"
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

                  {/* Role select */}
                  <div>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      disabled={isRegistering}
                      className="w-full cursor-pointer rounded-xl border border-gray-700/50 bg-gray-950/60 px-4 py-3 text-white outline-none transition-all duration-200 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/20 disabled:opacity-50 [&>option]:bg-gray-900 [&>option]:text-white"
                    >
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

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
