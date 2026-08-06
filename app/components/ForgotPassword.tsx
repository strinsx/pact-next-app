"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import { useState } from "react";
import { resetPassword } from "@/app/lib/services/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await resetPassword(email, "/auth/reset-password");

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="mt-8 font-poppins text-2xl font-bold text-primary">
        Forgot Password
      </h1>
      <p className="mt-2 font-poppins text-sm font-semibold text-muted">
        We will email you a link to reset it
      </p>
      <motion.div
        className="mt-8 w-full max-w-md"
        animate={{ height: "auto" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ overflow: "hidden" }}
      >
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-5 rounded-2xl border-1 border-border bg-surface p-8"
        >
          {sent ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                <Mail className="h-6 w-6 text-secondary" />
              </div>
              <h2 className="font-poppins text-lg font-bold text-primary">
                Check your email
              </h2>
              <p className="font-nunito text-sm text-muted">
                If an account exists for {email}, a password reset link is on
                its way. Follow the link to choose a new password.
              </p>
              <Link
                href="/auth/login"
                className="mt-2 font-nunito text-sm font-bold text-primary hover:text-secondary"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <p className="rounded-lg border-1 border-red-500/30 bg-red-500/10 px-3 py-2 font-nunito text-sm text-red-500">
                  {error}
                </p>
              )}
              <div className="flex flex-col gap-1">
                <label className="font-poppins text-sm font-light text-secondary">
                  Email Address
                </label>
                <div className="relative mx-2">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/20" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border-1 border-border bg-transparent py-1 pl-11 pr-4 font-nunito text-sm text-primary shadow-sm placeholder:text-muted focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-secondary py-1 font-nunito font-bold text-md text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <KeyRound className="h-4 w-4 text-white/70" />
                {loading ? "Sending Link..." : "Send Reset Link"}
              </button>
              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-1 font-nunito text-sm font-bold text-muted transition-colors hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </>
          )}
        </form>
      </motion.div>
    </div>
  );
}
