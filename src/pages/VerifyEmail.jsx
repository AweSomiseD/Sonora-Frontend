import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import AuthCard from "../components/AuthCard.jsx";
import { Button, Input, Spinner } from "../components/ui/index.jsx";
import usePageTitle from "../hooks/usePageTitle.js";
import api, { getErrorMessage } from "../services/api.js";

export const VerifyEmail = () => {
  usePageTitle("Verify email");
  const { token } = useParams();
  const started = useRef(false);
  const [state, setState] = useState({ status: "loading", message: "Verifying your email..." });
  const [email, setEmail] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (started.current) return; // StrictMode runs effects twice in development
    started.current = true;
    api
      .get(`/auth/verify-email/${token}`, { skipAuthRefresh: true })
      .then(({ data }) => setState({ status: "success", message: data.message }))
      .catch((error) => setState({ status: "error", message: getErrorMessage(error, "Email verification failed") }));
  }, [token]);

  const handleResend = async (event) => {
    event.preventDefault();
    if (!email.trim()) return setResendMessage("Please enter your email");
    setSending(true);
    try {
      const { data } = await api.post("/auth/resend-verification", { email: email.trim() }, { skipAuthRefresh: true });
      setResendMessage(data.message);
      setEmail("");
    } catch (error) {
      setResendMessage(getErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthCard title="Email verification" footer={<Link to="/login" className="font-semibold text-violet-300 hover:underline">Go to login</Link>}>
      <div className="flex flex-col items-center text-center" role="status">
        {state.status === "loading" && <Spinner className="text-3xl" />}
        {state.status === "success" && <FaCheckCircle className="text-4xl text-emerald-400" aria-hidden="true" />}
        {state.status === "error" && <FaTimesCircle className="text-4xl text-red-400" aria-hidden="true" />}
        <p className="mt-3 text-sm text-gray-300">{state.message}</p>
      </div>

      {state.status === "error" && (
        <form onSubmit={handleResend} className="mt-6 space-y-3 border-t border-violet-500/10 pt-6">
          <p className="text-sm text-gray-400">Link expired? Get a new one:</p>
          <Input type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <Button type="submit" className="w-full" loading={sending}>
            Resend verification email
          </Button>
          {resendMessage && <p className="text-sm text-violet-200">{resendMessage}</p>}
        </form>
      )}
    </AuthCard>
  );
};

export default VerifyEmail;
