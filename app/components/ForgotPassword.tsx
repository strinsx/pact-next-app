"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { resetPassword } from "@/app/lib/services/auth";
import AuthIllustrationPanel from "@/app/components/AuthIllustrationPanel";

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
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="relative mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl shadow-lg shadow-purple-900/10 lg:flex-row">
        <div className="flex w-full items-center justify-center px-4 py-10 lg:w-[50%]">
          <div className="relative w-full max-w-[480px] p-2 sm:p-8">
            {error && !sent && (
              <p className="mb-5 rounded-lg border-1 border-red-500/30 bg-red-500/10 px-3 py-2 font-dm-sans text-sm text-red-500">
                {error}
              </p>
            )}
            <div className="flex items-center justify-center pr-15">
              <Image
                src="/new_logo.png"
                alt="Pact logo"
                width={80}
                height={48}
                priority
                className="h-12 w-20"
              />
              <span className="-ml-5 font-manrope text-2xl font-extrabold tracking-tight text-primary">
                Pact
              </span>
            </div>
            <h1 className="mt-10 text-center font-manrope text-3xl font-extrabold text-primary">
              Forgot Password
            </h1>
            <p className="mt-2 text-center font-dm-sans text-sm text-muted">
              We&apos;ll email you a link to reset it.
            </p>
            {sent ? (
              <div className="mt-10 flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                  <Mail className="h-6 w-6 text-secondary" />
                </div>
                <h2 className="font-manrope text-lg font-bold text-primary">
                  Check your email
                </h2>
                <p className="font-dm-sans text-sm text-muted">
                  If an account exists for {email}, a password reset link is on
                  its way. Follow the link to choose a new password.
                </p>
                <Link
                  href="/auth/login"
                  className="mt-2 font-dm-sans text-sm font-bold text-primary hover:text-secondary"
                >
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email"
                    className="font-dm-sans text-sm font-medium text-muted"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/40" />
                    <input
                      id="email"
                      type="email"
                      placeholder="you@pact.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-10 w-full rounded-lg border-1 border-border bg-surface pl-10 pr-3.5 font-dm-sans text-sm text-primary shadow-sm placeholder:text-muted/50 focus:border-purple focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="h-10 w-full cursor-pointer rounded-lg bg-secondary font-dm-sans font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Sending Link..." : "Send Reset Link"}
                  </button>
                </div>
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-1 font-dm-sans text-sm font-bold text-muted transition-colors hover:text-primary"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </form>
            )}
          </div>
        </div>
        <AuthIllustrationPanel />
      </div>
    </div>
  );
}