"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GoogleButton from "./GoogleButton";
import AuthFooter from "./AuthFooter";

interface FormState {
  name: string;
  email: string;
  password: string;
  orgName: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    orgName: "",
  });
  const [accountType, setAccountType] = useState<"Business" | "Individual">("Individual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpMessage, setOtpMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, accountType }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed. Please try again.");
      } else {
        setShowOtp(true);
        setOtpMessage(data.message || "Verification code sent to your email.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Verification failed. Please try again.");
      } else {
        router.push("/dashboard");
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
    setOtpMessage("");

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to resend verification code. Please try again.");
      } else {
        setOtpMessage(data.message || "A new verification code has been sent.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (showOtp) {
    return (
      <>
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-white text-xl font-semibold">
            Verify Email
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
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>

        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          Please enter the 6-digit verification code sent to <br />
          <span className="text-zinc-200 font-medium break-all">{form.email}</span>.
        </p>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-950/30 border border-red-900/50 text-red-400 text-sm">
            {error}
          </div>
        )}

        {otpMessage && !error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 text-sm">
            {otpMessage}
          </div>
        )}

        <form onSubmit={handleVerifyOtp} className="space-y-6">
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
              className="w-full px-4 py-4 rounded-lg border border-zinc-800 bg-[#0c0e12] text-zinc-100 text-2xl font-mono text-center tracking-[0.5em] placeholder-zinc-700 outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700/50 transition"
            />
          </div>

          <div className="flex gap-3">
            <button
              id="otp-submit"
              type="submit"
              disabled={loading || otp.length !== 6}
              className="flex-1 py-3 rounded-lg border border-zinc-800 bg-[#161b22] hover:bg-[#21262d] hover:border-zinc-700 active:scale-95 text-zinc-100 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Verifying..." : "Verify Code"}
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
              setShowOtp(false);
              setOtp("");
              setError("");
              setOtpMessage("");
            }}
            className="text-zinc-500 hover:text-zinc-400 hover:underline transition-colors cursor-pointer"
          >
            ← Back to Sign Up
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-8">
        <h2 className="text-white text-xl font-semibold">
          Sign Up
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
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="2" />
        </svg>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-950/30 border border-red-900/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {accountType === "Business" && (
          <input
            id="register-orgname"
            name="orgName"
            type="text"
            placeholder="Business / Organization Name"
            value={form.orgName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-zinc-800 bg-[#0c0e12] text-zinc-100 text-sm placeholder-zinc-500 outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700/50 transition"
          />
        )}
        <input
          id="register-name"
          name="name"
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 rounded-lg border border-zinc-800 bg-[#0c0e12] text-zinc-100 text-sm placeholder-zinc-500 outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700/50 transition"
        />
        <input
          id="register-email"
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 rounded-lg border border-zinc-800 bg-[#0c0e12] text-zinc-100 text-sm placeholder-zinc-500 outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700/50 transition"
        />
        <input
          id="register-password"
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          minLength={8}
          className="w-full px-4 py-3 rounded-lg border border-zinc-800 bg-[#0c0e12] text-zinc-100 text-sm placeholder-zinc-500 outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700/50 transition"
        />

        {/* Checkboxes + Forgot Password Row */}
        <div className="flex justify-between items-center text-xs text-zinc-400 font-medium py-1">
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-300 transition-colors select-none">
              <input
                type="checkbox"
                checked={accountType === "Business"}
                onChange={() => setAccountType("Business")}
                className="w-3.5 h-3.5 rounded border border-zinc-800 bg-[#0c0e12] text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-emerald-500"
              />
              Business
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-300 transition-colors select-none">
              <input
                type="checkbox"
                checked={accountType === "Individual"}
                onChange={() => setAccountType("Individual")}
                className="w-3.5 h-3.5 rounded border border-zinc-800 bg-[#0c0e12] text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-emerald-500"
              />
              Individual
            </label>
          </div>
          <div>
            <a href="/forgot-password" className="hover:text-zinc-300 transition-colors">
              Forgot Password?
            </a>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="flex-1 py-3 rounded-lg border border-zinc-800 bg-[#161b22] hover:bg-[#21262d] hover:border-zinc-700 active:scale-95 text-zinc-100 text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
          <GoogleButton />
        </div>
      </form>

      <AuthFooter
        promptText="Already Have An Account?"
        linkText="Sign In"
        linkHref="/login"
      />
    </>
  );
}
