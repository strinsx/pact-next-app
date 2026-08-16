"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useState } from "react";
import { signUpWithEmail, signInWithGoogle } from "@/app/lib/services/auth";
import { createProfile } from "@/app/lib/services/profile";
import AuthIllustrationPanel from "@/app/components/AuthIllustrationPanel";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { data, error } = await signUpWithEmail(email, password, fullName);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await createProfile(
        data.user.id,
        fullName
      );
      setLoading(false);

      if (profileError) {
        setError(profileError.message);
        return;
      }
    } else {
      setLoading(false);
    }

    window.location.href = "/auth/onboarding";
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="relative mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl shadow-lg shadow-purple-900/10 lg:flex-row">
        <div className="flex w-full items-center justify-center px-4 py-10 lg:w-[50%]">
          <div className="relative w-full max-w-[480px] p-2 sm:p-8">
            {error && (
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
              Create your account
            </h1>
            <p className="mt-2 text-center font-dm-sans text-sm text-muted">
              Join Pact and start building consistency today.
            </p>
            <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="full-name"
                  className="font-dm-sans text-sm font-medium text-muted"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/40" />
                  <input
                    id="full-name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-10 w-full rounded-lg border-1 border-border bg-surface pl-10 pr-3.5 font-dm-sans text-sm text-primary shadow-sm placeholder:text-muted/50 focus:border-purple focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="font-dm-sans text-sm font-medium text-muted"
                >
                  Email
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
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="font-dm-sans text-sm font-medium text-muted"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/40" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-10 w-full rounded-lg border-1 border-border bg-surface pl-10 pr-10 font-dm-sans text-sm text-primary shadow-sm placeholder:text-muted/50 focus:border-purple focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-muted/40 transition-colors hover:text-muted"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="confirm-password"
                  className="font-dm-sans text-sm font-medium text-muted"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/40" />
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-10 w-full rounded-lg border-1 border-border bg-surface pl-10 pr-10 font-dm-sans text-sm text-primary shadow-sm placeholder:text-muted/50 focus:border-purple focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-muted/40 transition-colors hover:text-muted"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-10 w-full cursor-pointer rounded-lg bg-secondary font-dm-sans font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing Up..." : "Sign Up"}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="font-dm-sans text-xs text-muted/60">OR</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="text-center font-dm-sans text-sm text-muted">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="cursor-pointer font-bold text-primary transition-colors hover:text-secondary"
                >
                  Sign in
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="flex h-10 w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg border-1 border-border bg-surface font-dm-sans font-semibold text-primary shadow-sm transition-colors hover:bg-border/50"
                >
                  <Image
                    src="/google.png"
                    alt="Google"
                    width={16}
                    height={16}
                    className="h-4 w-4"
                  />
                  Continue with Google
                </button>
              </div>
            </form>
          </div>
        </div>
        <AuthIllustrationPanel mascot="/paxi-happy.svg" />
      </div>
    </div>
  );
}