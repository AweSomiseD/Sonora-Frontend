import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getDashboardPath } from "../routes/routePaths.js";

export const Login = () => {
  const { login, isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (window.location.pathname === "/login") {
        navigate(getDashboardPath(user?.role), { replace: true });
      }
    }
  }, [isAuthenticated, loading, navigate, user?.role]);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState({});
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [toast, setToast] = useState(null);
  const [showToast, setShowToast] = useState(false);

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

  const validateLoginField = (fieldName, value) => {
    const newErrors = { ...loginErrors };

    switch (fieldName) {
      case "loginEmail":
        if (!value.trim()) {
          newErrors.loginEmail = "Email is required";
        } else {
          delete newErrors.loginEmail;
        }
        break;

      case "loginPassword":
        if (!value.trim()) {
          newErrors.loginPassword = "Password is required";
        } else {
          delete newErrors.loginPassword;
        }
        break;

      default:
        break;
    }

    setLoginErrors(newErrors);
  };

  const validateLogin = () => {
    const newErrors = {};

    if (!loginEmail.trim()) {
      newErrors.loginEmail = "Email is required";
    }

    if (!loginPassword.trim()) {
      newErrors.loginPassword = "Password is required";
    }

    setLoginErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearLoginForm = () => {
    setLoginEmail("");
    setLoginPassword("");
    setLoginErrors({});
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateLogin()) {
      return;
    }

    setIsLoggingIn(true);

    try {
      const result = await login(loginEmail, loginPassword);

      if (result.success) {
        clearLoginForm();
        showToastMessage("✅ Login successful! Welcome back.", "success");
        navigate(getDashboardPath(result.data?.user?.role || user?.role), {
          replace: true,
        });
      } else {
        showToastMessage(`❌ ${result.message || "Login failed."}`, "error");
        setIsLoggingIn(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      showToastMessage(`❌ ${error.message || "Login failed."}`, "error");
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/api/auth/google";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 relative">
      {showToast && toast && (
        <div
          className={`fixed top-6 right-6 z-50 transform transition-all duration-500 ${
            showToast
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          }`}
        >
          <div
            className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[320px] max-w-md border-l-4 ${
              toast.type === "success"
                ? "bg-green-50 border-green-500 text-green-800"
                : "bg-red-50 border-red-500 text-red-800"
            }`}
          >
            <p className="font-semibold">{toast.message}</p>

            <button
              onClick={() => setShowToast(false)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-lg border border-white/50">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>

          <div className="w-20 h-1 bg-linear-to-r from-blue-600 to-indigo-600 mx-auto mt-2 rounded-full"></div>
        </div>

        <form className="flex flex-col gap-2" onSubmit={handleLogin}>
          <div>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => {
                setLoginEmail(e.target.value);
                validateLoginField("loginEmail", e.target.value);
              }}
              placeholder="Email"
              disabled={isLoggingIn}
              className={`w-full px-4 py-3 rounded-xl border ${
                loginErrors.loginEmail
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-100"
              } bg-white/50 focus:bg-white focus:ring-4 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400`}
            />

            {loginErrors.loginEmail && (
              <p className="text-red-500 text-sm mt-1.5 ml-1">
                {loginErrors.loginEmail}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => {
                setLoginPassword(e.target.value);
                validateLoginField("loginPassword", e.target.value);
              }}
              placeholder="Password"
              disabled={isLoggingIn}
              className={`w-full px-4 py-3 rounded-xl border ${
                loginErrors.loginPassword
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-100"
              } bg-white/50 focus:bg-white focus:ring-4 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400`}
            />

            {loginErrors.loginPassword && (
              <p className="text-red-500 text-sm mt-1.5 ml-1">
                {loginErrors.loginPassword}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-gray-600 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg mt-1"
          >
            Continue with Google
          </button>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg mt-1 disabled:opacity-50"
          >
            {isLoggingIn ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Don't have an account?{" "}
            <NavLink
              to="/register"
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Register here
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};
