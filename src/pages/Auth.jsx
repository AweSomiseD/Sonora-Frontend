import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export const Auth = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // ========================================
  // Redirect - Improved with path check
  // ========================================
  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Sirf tab redirect karein jab /auth page par ho
      if (window.location.pathname === "/auth") {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, loading, navigate]);

  // ========================================
  // Register States
  // ========================================
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("listener");
  const [registerErrors, setRegisterErrors] = useState({});
  const [isRegistering, setIsRegistering] = useState(false);

  // ========================================
  // Login States - Alag errors
  // ========================================
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState({});
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ========================================
  // UI States
  // ========================================
  const [isLogin, setIsLogin] = useState(false);
  const [toast, setToast] = useState(null);
  const [showToast, setShowToast] = useState(false);

  // ========================================
  // Password Validation
  // ========================================
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  const isPasswordValid = (value = "") => {
    if (!value) return false;
    return passwordRegex.test(value);
  };

  // ========================================
  // Toast with Cleanup
  // ========================================
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);

      // Cleanup function - important!
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const showToastMessage = (message, type = "success") => {
    setToast({ message, type });
    setShowToast(true);
  };

  // ========================================
  // Clear Forms
  // ========================================
  const clearRegisterForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setRole("listener");
    setRegisterErrors({});
  };

  const clearLoginForm = () => {
    setLoginEmail("");
    setLoginPassword("");
    setLoginErrors({});
  };

  // ========================================
  // Register Field Validation
  // ========================================
  const validateRegisterField = (fieldName, value) => {
    const newErrors = { ...registerErrors };

    switch (fieldName) {
      case "username":
        if (!value.trim()) {
          newErrors.username = "Username is required";
        } else {
          delete newErrors.username;
        }
        break;

      case "email":
        if (!value.trim()) {
          newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.email = "Email is invalid";
        } else {
          delete newErrors.email;
        }
        break;

      case "password":
        if (!value) {
          delete newErrors.password;
        } else if (!isPasswordValid(value)) {
          newErrors.password = "Password does not meet requirements";
        } else {
          delete newErrors.password;
        }
        break;

      default:
        break;
    }

    setRegisterErrors(newErrors);
  };

  // ========================================
  // Login Field Validation - Alag function
  // ========================================
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

  // ========================================
  // Register Validation
  // ========================================
  const validateRegister = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (!isPasswordValid(password)) {
      newErrors.password = "Password does not meet requirements";
    }

    if (!role) {
      newErrors.role = "Role is required";
    }

    setRegisterErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ========================================
  // Login Validation - Alag function
  // ========================================
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

  // ========================================
  // Handle Register - Improved
  // ========================================
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateRegister()) {
      return;
    }

    setIsRegistering(true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username,
          email,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Success
      clearRegisterForm();
      showToastMessage("✅ Account registered successfully!", "success");

      // Switch to login after 1.5 seconds
      setTimeout(() => {
        setIsLogin(true);
        setIsRegistering(false);
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      showToastMessage(
        `❌ ${error.message || "Registration failed. Please try again."}`,
        "error",
      );
      setIsRegistering(false);
    }
  };

  // ========================================
  // Handle Login - Improved
  // ========================================
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
        navigate("/", { replace: true });
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

  // ========================================
  // Role Options
  // ========================================
  const roleOptions = [
    { value: "listener", label: "Listener" },
    { value: "artist", label: "Artist" },
  ];

  // ========================================
  // Switch between Login/Register
  // ========================================
  const switchToLogin = () => {
    setIsLogin(true);
    clearRegisterForm();
    setIsRegistering(false);
  };

  const switchToRegister = () => {
    setIsLogin(false);
    clearLoginForm();
    setIsLoggingIn(false);
  };

  // ========================================
  // Loading state for buttons
  // ========================================
  const isProcessing = isRegistering || isLoggingIn;

  // ========================================
  // Google Login Handler
  // ========================================
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/api/auth/google";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 relative">
      {/* Toast Notification */}
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
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                toast.type === "success" ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {toast.type === "success" ? (
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>

            <div>
              <p className="font-semibold">{toast.message}</p>
            </div>

            <button
              onClick={() => setShowToast(false)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-lg border border-white/50 min-h-150">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Authentication
          </h1>

          <div className="w-20 h-1 bg-linear-to-r from-blue-600 to-indigo-600 mx-auto mt-2 rounded-full"></div>
        </div>

        {/* Toggle Buttons */}
        <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={switchToRegister}
            disabled={isProcessing}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
              !isLogin
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                : "text-gray-600 hover:bg-gray-200"
            } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Register
          </button>

          <button
            onClick={switchToLogin}
            disabled={isProcessing}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
              isLogin
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                : "text-gray-600 hover:bg-gray-200"
            } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Login
          </button>
        </div>

        {/* ========================================
            REGISTER FORM
        ======================================== */}

        {!isLogin ? (
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
              <h2 className="text-2xl font-semibold text-gray-800">Register</h2>
            </div>

            <form className="flex flex-col gap-2" onSubmit={handleRegister}>
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
                  disabled={isProcessing}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    registerErrors.username
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                  } bg-white/50 focus:bg-white focus:ring-4 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400 ${
                    isProcessing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />

                {registerErrors.username && (
                  <p className="text-red-500 text-sm mt-1.5 ml-1">
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
                  disabled={isProcessing}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    registerErrors.email
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                  } bg-white/50 focus:bg-white focus:ring-4 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400 ${
                    isProcessing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />

                {registerErrors.email && (
                  <p className="text-red-500 text-sm mt-1.5 ml-1">
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
                  disabled={isProcessing}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    registerErrors.password
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                  } bg-white/50 focus:bg-white focus:ring-4 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400 ${
                    isProcessing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />

                {registerErrors.password && (
                  <p className="text-red-500 text-sm mt-1.5 ml-1">
                    {registerErrors.password}
                  </p>
                )}
              </div>

              {/* Role */}
              <div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isProcessing}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    registerErrors.role
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                  } bg-white/50 focus:bg-white focus:ring-4 transition-all duration-200 outline-none text-gray-700 ${
                    isProcessing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="" disabled>
                    Select Role
                  </option>

                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {registerErrors.role && (
                  <p className="text-red-500 text-sm mt-1.5 ml-1">
                    {registerErrors.role}
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="text-sm space-y-1.5 mt-2 bg-gray-50/80 p-3 rounded-xl">
                <p
                  className={
                    password.length >= 8 ? "text-green-600" : "text-gray-500"
                  }
                >
                  {password.length >= 8 ? "✓" : "○"} At least 8 characters
                </p>

                <p
                  className={
                    /[a-z]/.test(password) ? "text-green-600" : "text-gray-500"
                  }
                >
                  {/[a-z]/.test(password) ? "✓" : "○"} One lowercase letter
                </p>

                <p
                  className={
                    /[A-Z]/.test(password) ? "text-green-600" : "text-gray-500"
                  }
                >
                  {/[A-Z]/.test(password) ? "✓" : "○"} One uppercase letter
                </p>

                <p
                  className={
                    /\d/.test(password) ? "text-green-600" : "text-gray-500"
                  }
                >
                  {/\d/.test(password) ? "✓" : "○"} One number
                </p>

                <p
                  className={
                    /[@$!%*?&]/.test(password)
                      ? "text-green-600"
                      : "text-gray-500"
                  }
                >
                  {/[@$!%*?&]/.test(password) ? "✓" : "○"} One special character
                </p>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 cursor-pointer mt-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isRegistering ? "Registering..." : "Register"}
              </button>
            </form>
          </div>
        ) : (
          /* ========================================
             LOGIN FORM
          ======================================== */

          <div className="mb-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 bg-indigo-600 rounded-full"></div>
              <h2 className="text-2xl font-semibold text-gray-800">Login</h2>
            </div>

            <form className="flex flex-col gap-2" onSubmit={handleLogin}>
              {/* Login Email */}
              <div>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    validateLoginField("loginEmail", e.target.value);
                  }}
                  placeholder="Email"
                  disabled={isProcessing}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    loginErrors.loginEmail
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-100"
                  } bg-white/50 focus:bg-white focus:ring-4 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400 ${
                    isProcessing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                />

                {loginErrors.loginEmail && (
                  <p className="text-red-500 text-sm mt-1.5 ml-1">
                    {loginErrors.loginEmail}
                  </p>
                )}
              </div>

              {/* Login Password */}
              <div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    validateLoginField("loginPassword", e.target.value);
                  }}
                  placeholder="Password"
                  disabled={isProcessing}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    loginErrors.loginPassword
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-100"
                  } bg-white/50 focus:bg-white focus:ring-4 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400 ${
                    isProcessing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
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
                className="w-full bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-red-500/25 hover:shadow-red-500/40 cursor-pointer mt-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Continue with Google
              </button>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 cursor-pointer mt-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoggingIn ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        )}

        {/* Bottom Toggle */}
        <div className="mt-6 text-center text-sm text-gray-500">
          {!isLogin ? (
            <p>
              Already have an account?{" "}
              <button
                onClick={switchToLogin}
                disabled={isProcessing}
                className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Login here
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <button
                onClick={switchToRegister}
                disabled={isProcessing}
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Register here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
