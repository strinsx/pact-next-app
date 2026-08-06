"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Lock, Eye, EyeOff, KeyRound, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser, updatePassword } from "@/app/lib/services/auth";

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
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="mt-8 font-poppins text-2xl font-bold text-primary">
        Reset Password
      </h1>
      <p className="mt-2 font-poppins text-sm font-semibold text-muted">
        Choose a new password for your account
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
          {done ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal/10">
                <CheckCircle2 className="h-6 w-6 text-teal" />
              </div>
              <h2 className="font-poppins text-lg font-bold text-primary">
                Password updated
              </h2>
              <p className="font-nunito text-sm text-muted">
                Your password has been changed. Sign in with your new password.
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
              {loading ? (
                <p className="text-center font-nunito text-sm text-muted">
                  Checking your reset link...
                </p>
              ) : (
                <>
                  {error && (
                    <div className="flex flex-col gap-3">
                      <p className="rounded-lg border-1 border-red-500/30 bg-red-500/10 px-3 py-2 font-nunito text-sm text-red-500">
                        {error}
                      </p>
                      {!error.includes("Passwords") && (
                        <Link
                          href="/auth/forgot-password"
                          className="text-center font-nunito text-sm font-bold text-primary hover:text-secondary"
                        >
                          Request a new link
                        </Link>
                      )}
                    </div>
                  )}
                  {!error && (
                    <>
                      <div className="flex flex-col gap-1">
                        <label className="font-poppins text-sm font-light text-secondary">
                          New Password
                        </label>
                        <div className="relative mx-2">
                          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/20" />
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="New password"
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
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-poppins text-sm font-light text-secondary">
                          Confirm New Password
                        </label>
                        <div className="relative mx-2">
                          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/20" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full rounded-xl border-1 border-border bg-transparent py-1 pl-11 pr-11 font-nunito text-sm text-primary shadow-sm placeholder:text-muted focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-muted/30"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={saving}
                        className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-secondary py-1 font-nunito font-bold text-md text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <KeyRound className="h-4 w-4 text-white/70" />
                        {saving ? "Updating..." : "Update Password"}
                      </button>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </form>
      </motion.div>
    </div>
  );
}
