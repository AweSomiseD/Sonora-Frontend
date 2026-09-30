import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getDashboardPath } from "../routes/routePaths.js";

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
            Create Account
          </h1>

          <div className="w-20 h-1 bg-linear-to-r from-blue-600 to-indigo-600 mx-auto mt-2 rounded-full"></div>
        </div>

        <form className="flex flex-col gap-2" onSubmit={handleRegister}>
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
              className={`w-full px-4 py-3 rounded-xl border ${
                registerErrors.username
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
              } bg-white/50 focus:bg-white focus:ring-4 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400`}
            />

            {registerErrors.username && (
              <p className="text-red-500 text-sm mt-1.5 ml-1">
                {registerErrors.username}
              </p>
            )}
          </div>

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
              className={`w-full px-4 py-3 rounded-xl border ${
                registerErrors.email
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
              } bg-white/50 focus:bg-white focus:ring-4 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400`}
            />

            {registerErrors.email && (
              <p className="text-red-500 text-sm mt-1.5 ml-1">
                {registerErrors.email}
              </p>
            )}
          </div>

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
              className={`w-full px-4 py-3 rounded-xl border ${
                registerErrors.password
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
              } bg-white/50 focus:bg-white focus:ring-4 transition-all duration-200 outline-none text-gray-700 placeholder-gray-400`}
            />

            {registerErrors.password && (
              <p className="text-red-500 text-sm mt-1.5 ml-1">
                {registerErrors.password}
              </p>
            )}
          </div>

          <div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isRegistering}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-blue-100 bg-white/50 focus:bg-white focus:ring-4 transition-all duration-200 outline-none text-gray-700"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

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
                /[@$!%*?&]/.test(password) ? "text-green-600" : "text-gray-500"
              }
            >
              {/[@$!%*?&]/.test(password) ? "✓" : "○"} One special character
            </p>
          </div>

          <button
            type="submit"
            disabled={isRegistering}
            className="w-full bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-lg mt-1 disabled:opacity-50"
          >
            {isRegistering ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Already have an account?{" "}
            <NavLink
              to="/login"
              className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
            >
              Login here
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};
