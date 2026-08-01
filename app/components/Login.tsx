"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { getPostAuthDestination } from "@/app/lib/auth/redirect";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.user) {
      const destination = await getPostAuthDestination(data.user.id);
      window.location.href = destination;
      return;
    }

    window.location.href = "/auth/onboarding";
  };

  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="mt-8 font-poppins text-2xl font-bold text-primary">
        Start Your Pact
      </h1>
      <p className="mt-2 font-poppins text-sm font-semibold text-muted">
        Create Your Accountability Group
      </p>
      <form
        onSubmit={handleSignIn}
        className="mt-8 flex w-full max-w-md flex-col gap-5 rounded-2xl border-1 border-border bg-surface p-8"
      >
        {error && (
          <p className="rounded-lg border-1 border-red-500/30 bg-red-500/10 px-3 py-2 font-nunito text-sm text-red-500">
            {error}
          </p>
        )}
        <h2 className="font-poppins text-base font-light text-100 text-sm text-secondary">
          Email Address
        </h2>
        <div className="relative mx-2">
          <Mail
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/20"
          />
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border-1 border-border bg-transparent py-1 pl-11 pr-4 font-nunito text-sm text-primary shadow-sm placeholder:text-muted focus:outline-none"
          />
        </div>
        <h2 className="font-poppins text-base font-light text-100 text-sm text-secondary">
          Password
        </h2>
        <div className="relative mx-2">
          <Lock
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/20"
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl border-1 border-border bg-transparent py-1 pl-11 pr-11 font-nunito text-sm text-primary shadow-sm placeholder:text-muted focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-muted/30"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full cursor-pointer rounded-xl bg-secondary py-1 font-nunito font-bold text-md text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowRight className="mr-2 h-4 w-4 text-white/70" />
          {loading ? "Signing In..." : "Sign In"}
        </button>
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="font-poppins text-xs text-muted">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full cursor-pointer rounded-xl border-1 border-border bg-transparent py-1 font-nunito font-bold text-md text-primary shadow-sm"
        >
          <Image src="/google.png" alt="Google" width={16} height={16} className="mr-2 inline h-4 w-4" />
          Continue with Google
        </button>
      </form>
      <p className="mt-6 font-nunito text-sm text-muted/50">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="font-bold text-primary ">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
