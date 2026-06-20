"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthFooter from "./AuthFooter";

type Step = "request" | "reset" | "success";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [step, setStep] = useState<Step>("request");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setStatusMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to send reset code. Please try again.");
      } else {
        setStep("reset");
        setStatusMessage(data.message || "A verification code has been sent to your email.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to reset password. Please try again.");
      } else {
        setStep("success");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError("");
    setStatusMessage("");

    try {
      const res = await fetch("/api/auth/resend-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to resend code. Please try again.");
      } else {
        setStatusMessage(data.message || "A new verification code has been sent.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="text-center py-4">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-emerald-950/40 border border-emerald-900/60 text-emerald-500 rounded-full">
            <svg
              className="w-8 h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        <h2 className="text-white text-xl font-semibold mb-3">
          Password Reset Successful
        </h2>
        <p className="text-zinc-400 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
          Your password has been reset successfully. You can now sign in using your new password.
        </p>

        <button
          onClick={() => router.push("/login")}
          className="w-full py-3 rounded-lg border border-zinc-800 bg-[#161b22] hover:bg-[#21262d] hover:border-zinc-700 active:scale-95 text-zinc-100 text-sm font-semibold transition-all cursor-pointer"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  if (step === "reset") {
    return (
      <>
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-white text-xl font-semibold">
            Reset Password
          </h2>
          <svg
            className="w-5 h-5 text-zinc-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          Enter the 6-digit code sent to <span className="text-zinc-200 font-medium break-all">{email}</span> and your new password.
        </p>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-950/30 border border-red-900/50 text-red-400 text-sm">
            {error}
          </div>
        )}

        {statusMessage && !error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 text-sm">
            {statusMessage}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label htmlFor="otp-input" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Verification Code
            </label>
            <input
              id="otp-input"
              name="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setOtp(val);
                setError("");
              }}
              required
              className="w-full px-4 py-3 rounded-lg border border-zinc-800 bg-[#0c0e12] text-zinc-100 text-xl font-mono text-center tracking-[0.5em] placeholder-zinc-700 outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700/50 transition"
            />
          </div>

          <div>
            <label htmlFor="new-password" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              New Password
            </label>
            <input
              id="new-password"
              name="newPassword"
              type="password"
              placeholder="Min 8 characters"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError("");
              }}
              required
              minLength={8}
              className="w-full px-4 py-3 rounded-lg border border-zinc-800 bg-[#0c0e12] text-zinc-100 text-sm placeholder-zinc-500 outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700/50 transition"
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
              required
              minLength={8}
              className="w-full px-4 py-3 rounded-lg border border-zinc-800 bg-[#0c0e12] text-zinc-100 text-sm placeholder-zinc-500 outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700/50 transition"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              id="reset-submit"
              type="submit"
              disabled={loading || otp.length !== 6}
              className="flex-1 py-3 rounded-lg border border-zinc-800 bg-[#161b22] hover:bg-[#21262d] hover:border-zinc-700 active:scale-95 text-zinc-100 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>

        <div className="flex flex-col items-center gap-4 mt-8 pt-4 border-t border-zinc-900 text-xs text-zinc-400">
          <p>
            Didn't receive the email?{" "}
            <button
              type="button"
              disabled={loading}
              onClick={handleResendOtp}
              className="text-emerald-500 hover:text-emerald-400 hover:underline font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              Resend Code
            </button>
          </p>
          <button
            type="button"
            onClick={() => {
              setStep("request");
              setOtp("");
              setNewPassword("");
              setConfirmPassword("");
              setError("");
              setStatusMessage("");
            }}
            className="text-zinc-500 hover:text-zinc-400 hover:underline transition-colors cursor-pointer"
          >
            ← Back to Request Reset
          </button>
        </div>
      </>
    );
  }

  // default request step
  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-white text-xl font-semibold">
          Reset Password
        </h2>
        <svg
          className="w-5 h-5 text-zinc-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
        </svg>
      </div>

      <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
        Enter your registered email address. We will send you a 6-digit code to verify your identity.
      </p>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-950/30 border border-red-900/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleRequestOtp} className="space-y-4">
        <input
          id="forgot-email"
          name="email"
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          required
          className="w-full px-4 py-3 rounded-lg border border-zinc-800 bg-[#0c0e12] text-zinc-100 text-sm placeholder-zinc-500 outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700/50 transition"
        />

        <div className="flex gap-3 pt-2">
          <button
            id="forgot-submit"
            type="submit"
            disabled={loading || !email}
            className="flex-1 py-3 rounded-lg border border-zinc-800 bg-[#161b22] hover:bg-[#21262d] hover:border-zinc-700 active:scale-95 text-zinc-100 text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Sending..." : "Send Verification Code"}
          </button>
        </div>
      </form>

      <AuthFooter
        promptText="Remembered Your Password?"
        linkText="Sign In"
        linkHref="/login"
      />
    </>
  );
}
