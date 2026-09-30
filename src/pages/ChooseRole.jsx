import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import { getDashboardPath } from "../routes/routePaths.js";

const ChooseRole = () => {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { fetchCurrentUser } = useAuth();
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!role) {
      setError("Please select a role");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(
        "http://localhost:3000/api/auth/google/complete",
        { role },
        { withCredentials: true },
      );

      console.log("Google Registration:", response.data);

      // Update React AuthContext with the newly logged-in user
      await fetchCurrentUser();

      // Navigate after auth state has been updated
      navigate(getDashboardPath(response.data.user?.role || role), {
        replace: true,
      });
    } catch (error) {
      console.error("Google Registration Error:", error);

      setError(
        error.response?.data?.message ||
          "Google registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Choose Your Role</h1>

          <p className="mt-2 text-gray-500">
            Select how you want to use the platform.
          </p>
        </div>

        {/* Role Selection */}
        <div className="space-y-4">
          {/* User */}
          <button
            type="button"
            onClick={() => {
              setRole("listener");
              setError("");
            }}
            disabled={loading}
            className={`w-full p-5 rounded-xl border-2 text-left transition-all duration-200 ${
              role === "listener"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-blue-400 hover:bg-gray-50"
            } ${loading ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Listener
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Discover and enjoy music from artists.
                </p>
              </div>

              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  role === "listener" ? "border-blue-600" : "border-gray-300"
                }`}
              >
                {role === "listener" && (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                )}
              </div>
            </div>
          </button>

          {/* Artist */}
          <button
            type="button"
            onClick={() => {
              setRole("artist");
              setError("");
            }}
            disabled={loading}
            className={`w-full p-5 rounded-xl border-2 text-left transition-all duration-200 ${
              role === "artist"
                ? "border-purple-600 bg-purple-50"
                : "border-gray-200 hover:border-purple-400 hover:bg-gray-50"
            } ${loading ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Artist</h2>

                <p className="text-sm text-gray-500 mt-1">
                  Upload and share your music with users.
                </p>
              </div>

              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  role === "artist" ? "border-purple-600" : "border-gray-300"
                }`}
              >
                {role === "artist" && (
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Continue Button */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={!role || loading}
          className={`w-full mt-6 py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 ${
            !role || loading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-black hover:bg-gray-800 active:scale-[0.98]"
          }`}
        >
          {loading ? "Creating Account..." : "Continue"}
        </button>
      </div>
    </div>
  );
};

export default ChooseRole;
