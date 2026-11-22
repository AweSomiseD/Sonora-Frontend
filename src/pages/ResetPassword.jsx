import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaCheck, FaTimes } from "react-icons/fa";
import AuthCard from "../components/AuthCard.jsx";
import { Button, PasswordInput } from "../components/ui/index.jsx";
import { PASSWORD_RULES, isStrongPassword } from "../constants/index.js";
import { useToast } from "../context/ToastContext.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import api, { getErrorMessage } from "../services/api.js";

export const ResetPassword = () => {
  usePageTitle("Reset password");
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isStrongPassword(password)) return setError("Password does not meet the requirements");
    if (password !== confirmPassword) return setError("Passwords do not match");

    setLoading(true);
    setError("");
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { newPassword: password }, { skipAuthRefresh: true });
      showToast(data.message, "success");
      navigate("/login", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Password reset failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Choose a new password" subtitle="All your other sessions will be logged out." footer={<Link to="/login" className="font-semibold text-violet-300 hover:underline">Back to login</Link>}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <PasswordInput label="New password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
        <ul className="grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
          {PASSWORD_RULES.map((rule) => {
            const ok = rule.test(password);
            return (
              <li key={rule.label} className={`flex items-center gap-1.5 ${ok ? "text-emerald-300" : "text-gray-500"}`}>
                {ok ? <FaCheck aria-hidden="true" /> : <FaTimes aria-hidden="true" />} {rule.label}
              </li>
            );
          })}
        </ul>
        <PasswordInput label="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" error={error} required />
        <Button type="submit" className="w-full" loading={loading}>
          Reset password
        </Button>
      </form>
    </AuthCard>
  );
};

export default ResetPassword;
