"use client";

import Image from "next/image";
import Link from "next/link";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useState } from "react";
import { signUpWithEmail, signInWithGoogle } from "@/app/lib/services/auth";
import { createProfile } from "@/app/lib/services/profile";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
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

  const handleGoogleSignUp = async () => {
    await signInWithGoogle();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="mt-8 font-poppins text-2xl font-bold text-primary">
        Join Your Pact
      </h1>
      <p className="mt-2 font-poppins text-sm font-semibold text-muted">
        Create Your Accountability Group
      </p>
      <form
        onSubmit={handleSignUp}
        className="mt-8 flex w-full max-w-md flex-col gap-5 rounded-2xl border-1 border-border bg-surface p-8"
      >
        {error && (
          <p className="rounded-lg border-1 border-red-500/30 bg-red-500/10 px-3 py-2 font-nunito text-sm text-red-500">
            {error}
          </p>
        )}
        <h2 className="font-poppins text-sm font-light text-secondary">
          Full Name
        </h2>
        <div className="relative mx-2">
          <User
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/20"
          />
          <input
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full rounded-xl border-1 border-border bg-transparent py-1 pl-11 pr-4 font-nunito text-sm text-primary shadow-sm placeholder:text-muted focus:outline-none"
          />
        </div>
        <h2 className="font-poppins text-sm font-light text-secondary">
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
        <h2 className="font-poppins text-sm font-light text-secondary">
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
        <h2 className="font-poppins text-sm font-light text-secondary">
          Confirm Password
        </h2>
        <div className="relative mx-2">
          <Lock
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/20"
          />
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded-xl border-1 border-border bg-transparent py-1 pl-11 pr-11 font-nunito text-sm text-primary shadow-sm placeholder:text-muted focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-muted/30"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-secondary py-1 font-nunito font-bold text-md text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowRight className="h-4 w-4 text-white/70" />
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="font-poppins text-xs text-muted">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <button
          type="button"
          onClick={handleGoogleSignUp}
          className="w-full cursor-pointer rounded-xl border-1 border-border bg-transparent py-1 font-nunito font-bold text-md text-primary shadow-sm"
        >
          <Image
            src="/google.png"
            alt="Google"
            width={16}
            height={16}
            className="mr-2 inline h-4 w-4"
          />
          Continue with Google
        </button>
      </form>
      <p className="mt-6 font-nunito text-sm text-muted/50">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-bold text-primary">
          Sign In
        </Link>
      </p>
    </div>
  );
}
