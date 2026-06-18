"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GoogleButton from "./GoogleButton";
import AuthFooter from "./AuthFooter";

interface FormState {
  email: string;
  password: string;
}

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed. Please try again.");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-8">
        <h2 className="text-white text-xl font-semibold">
          Sign In
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
        <input
          id="login-email"
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 rounded-lg border border-zinc-800 bg-[#0c0e12] text-zinc-100 text-sm placeholder-zinc-500 outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700/50 transition"
        />
        <input
          id="login-password"
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 rounded-lg border border-zinc-800 bg-[#0c0e12] text-zinc-100 text-sm placeholder-zinc-500 outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700/50 transition"
        />

        <div className="flex justify-end">
          <a href="#" className="text-xs text-zinc-400 hover:text-zinc-300 font-medium transition-colors">
            Forgot Password?
          </a>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="flex-1 py-3 rounded-lg border border-zinc-800 bg-[#161b22] hover:bg-[#21262d] hover:border-zinc-700 active:scale-95 text-zinc-100 text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
          <GoogleButton />
        </div>
      </form>

      <AuthFooter
        promptText="Don't Have An Account?"
        linkText="Create Account ->"
        linkHref="/register"
      />
    </>
  );
}
