"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { signInWithEmail, signInWithGoogle } from "@/app/lib/services/auth";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await signInWithEmail(email, password);
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.user) {
      window.location.href = "/";
      return;
    }

    window.location.href = "/auth/onboarding";
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="relative mx-auto flex min-h-[70vh] w-full max-w-6xl flex-row overflow-hidden rounded-2xl shadow-lg shadow-purple-900/10">
        <div className="flex w-[50%] items-center justify-center px-4 py-10">
          <div className="relative w-full max-w-[480px] p-8">
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
              Log in to your account
            </h1>
            <p className="mt-2 text-center font-dm-sans text-sm text-muted">
              Welcome back! Please enter your details.
            </p>
            <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6">
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
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="remember-me"
                    className="flex cursor-pointer items-center gap-2.5"
                  >
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 cursor-pointer rounded border-border accent-teal"
                    />
                    <span className="font-dm-sans text-sm font-bold text-muted">
                      Remember me
                    </span>
                  </label>
                  <p className="pl-6.5 font-dm-sans text-xs text-muted/60">
                    Save my login details for next time.
                  </p>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="pt-0.5 font-dm-sans text-sm font-bold text-muted transition-colors hover:text-secondary"
                >
                  Forgot password?
                </Link>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-10 w-full cursor-pointer rounded-lg bg-secondary font-dm-sans font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="font-dm-sans text-xs text-muted/60">OR</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="text-center font-dm-sans text-sm text-muted">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="cursor-pointer font-bold text-primary transition-colors hover:text-secondary"
                >
                  Sign up
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
        <div className="relative flex w-[50%] items-center justify-center overflow-hidden bg-gradient-to-b from-blue-700 to-sky-400 p-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.3),rgba(86,217,200,0.18)_45%,transparent_70%)] blur-2xl"
          />

          <div className="flex h-full w-full flex-col justify-between">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-10 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap select-none text-center font-manrope text-8xl font-extrabold uppercase tracking-tight text-white drop-shadow-lg"
              >
              </div>

<div>
              <h1 className="max-w-md font-manrope text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md md:text-5xl">
                Progress feels good with a little company.
              </h1>
              <p className="mt-4 max-w-md font-dm-sans text-base leading-relaxed text-white/70">
                Stay on track with friends who keep you honest and celebrate
                every win along the way.
              </p>
            </div>

            <Image
              src="/paxi.svg"
              alt="Paxi mascot"
              width={420}
              height={420}
              priority
              className="relative z-10 h-auto max-w-full object-contain bottom-4"
            />

          </div>

        </div>
      </div>
    </div>
  );
}