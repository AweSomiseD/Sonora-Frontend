import { useState } from "react";
import { Link } from "react-router-dom";
import AuthCard from "../components/AuthCard.jsx";
import { Button, Input } from "../components/ui/index.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import api, { getErrorMessage } from "../services/api.js";

export const ForgotPassword = () => {
  usePageTitle("Forgot password");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/forgot-password", { email: email.trim() }, { skipAuthRefresh: true });
      setMessage(data.message);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we will send you a reset link."
      footer={
        <>
          Remembered it? <Link to="/login" className="font-semibold text-violet-300 hover:underline">Back to login</Link>
        </>
      }
    >
      {message ? (
        <p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          {message}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input type="email" label="Email" value={email} error={error} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          <Button type="submit" className="w-full" loading={loading}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthCard>
  );
};

export default ForgotPassword;
