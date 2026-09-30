import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

export const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("Verifying your email...");
  const hasVerified = useRef(false);
  const [email, setEmail] = useState("");
  const [showResend, setShowResend] = useState(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;
    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/auth/verify-email/${token}`,
        );
        const data = await response.json();
        if (response.ok) {
          setStatus(data.message);
        } else {
          setStatus(data.message || "Email verification failed");
          setShowResend(true);
        }
      } catch (error) {
        setStatus("Something went wrong");
      }
    };
    verifyEmail();
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email) {
      setStatus("Please enter your email");
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/resend-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();
      setStatus(data.message);
      if (response.ok) {
        setEmail("");
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      setStatus("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">{status}</h1>

        {showResend && (
          <form onSubmit={handleResend} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border p-3 outline-none"
            />

            <button
              type="submit"
              className="rounded-lg bg-black p-3 text-white cursor-pointer"
            >
              Resend Verification Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
