"use client";

import Link from "next/link";
import Image from "next/image";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser, updatePassword } from "@/app/lib/services/auth";
import AuthIllustrationPanel from "@/app/components/AuthIllustrationPanel";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const user = await getCurrentUser();
      if (!user) {
        setError("This reset link is invalid or has expired.");
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    const { error } = await updatePassword(password);
    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    setDone(true);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="relative mx-auto flex min-h-[70vh] w-full max-w-6xl flex-row overflow-hidden rounded-2xl shadow-lg shadow-purple-900/10">
        <div className="flex w-[50%] items-center justify-center px-4 py-10">
          <div className="relative w-full max-w-[480px] p-8">
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
              Reset Password
            </h1>
            <p className="mt-2 text-center font-dm-sans text-sm text-muted">
              Choose a new password for your account.
            </p>
            {done ? (
              <div className="mt-10 flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal/10">
                  <CheckCircle2 className="h-6 w-6 text-teal" />
                </div>
                <h2 className="font-manrope text-lg font-bold text-primary">
                  Password updated
                </h2>
                <p className="font-dm-sans text-sm text-muted">
                  Your password has been changed. Sign in with your new password.
                </p>
                <Link
                  href="/auth/login"
                  className="mt-2 font-dm-sans text-sm font-bold text-primary hover:text-secondary"
                >
                  Back to Sign In
                </Link>
              </div>
            ) : loading ? (
              <p className="mt-10 text-center font-dm-sans text-sm text-muted">
                Checking your reset link...
              </p>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-10 flex flex-col gap-6"
              >
                {error && (
                  <div className="flex flex-col gap-3">
                    <p className="rounded-lg border-1 border-red-500/30 bg-red-500/10 px-3 py-2 font-dm-sans text-sm text-red-500">
                      {error}
                    </p>
                    {!error.includes("Passwords") && (
                      <Link
                        href="/auth/forgot-password"
                        className="text-center font-dm-sans text-sm font-bold text-primary hover:text-secondary"
                      >
                        Request a new link
                      </Link>
                    )}
                  </div>
                )}
                {!error && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="reset-password"
                        className="font-dm-sans text-sm font-medium text-muted"
                      >
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/40" />
                        <input
                          id="reset-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your new password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="h-10 w-full rounded-lg border-1 border-border bg-surface pl-10 pr-10 font-dm-sans text-sm text-primary shadow-sm placeholder:text-muted/50 focus:border-purple focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-muted/40 transition-colors hover:text-muted"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
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
                        htmlFor="confirm-reset-password"
                        className="font-dm-sans text-sm font-medium text-muted"
                      >
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/40" />
                        <input
                          id="confirm-reset-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="h-10 w-full rounded-lg border-1 border-border bg-surface pl-10 pr-10 font-dm-sans text-sm text-primary shadow-sm placeholder:text-muted/50 focus:border-purple focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-muted/40 transition-colors hover:text-muted"
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
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
                        disabled={saving}
                        className="h-10 w-full cursor-pointer rounded-lg bg-secondary font-dm-sans font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
        <AuthIllustrationPanel />
      </div>
    </div>
  );
}