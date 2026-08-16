"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import {
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from "@/app/lib/services/auth";
import { createProfile } from "@/app/lib/services/profile";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.08 },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

type AuthMode = "signin" | "signup";

interface AuthFormProps {
  initialMode?: AuthMode;
  embedded?: boolean;
}

export default function AuthForm({
  initialMode = "signin",
  embedded = false,
}: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const switchMode = () => {
    setMode((prev) => (prev === "signin" ? "signup" : "signin"));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    if (mode === "signin") {
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
      return;
    }

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

  const isSignUp = mode === "signup";

  return (
    <div
      className={
        embedded
          ? "flex w-full flex-col items-center justify-center"
          : "flex min-h-screen flex-col items-center justify-center px-4"
      }
    >
      <Image
        src="/new_logo.png"
        alt="Pact logo"
        width={72}
        height={72}
        priority
        className="h-18 w-18"
      />
      <h1 className="mt-4 font-manrope text-3xl font-extrabold tracking-wide text-primary">
        PACT
      </h1>
      <motion.div
        className="mt-8 w-full max-w-md"
        animate={{ height: "auto" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ overflow: "hidden" }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={mode}
            initial={{ y: 12 }}
            animate={{ y: 0 }}
            exit={{ y: -12, transition: { duration: 0.15 } }}
            transition={{ duration: 0.3 }}
          >
            <motion.form
              onSubmit={handleSubmit}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex w-full flex-col gap-5 rounded-2xl border-1 border-border bg-surface p-8"
            >
              {error && (
                <motion.p
                  variants={fieldVariants}
                  className="rounded-lg border-1 border-red-500/30 bg-red-500/10 px-3 py-2 font-dm-sans text-sm text-red-500"
                >
                  {error}
                </motion.p>
              )}
              {isSignUp && (
                <motion.div
                  variants={fieldVariants}
                  className="flex flex-col gap-1"
                >
                  <label className="font-manrope text-sm font-light text-secondary">
                    Full Name
                  </label>
                  <div className="relative mx-2">
                    <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/20" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full rounded-xl border-1 border-border bg-transparent py-1 pl-11 pr-4 font-dm-sans text-sm text-primary shadow-sm placeholder:text-muted focus:outline-none"
                    />
                  </div>
                </motion.div>
              )}
              <motion.div
                variants={fieldVariants}
                className="flex flex-col gap-1"
              >
                <label className="font-manrope text-sm font-semibold text-muted">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/20" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 w-full rounded-xl border-1 border-border bg-transparent pl-11 pr-4 font-dm-sans text-sm text-primary shadow-sm placeholder:text-muted focus:outline-none"
                  />
                </div>
              </motion.div>
              <motion.div
                variants={fieldVariants}
                className="flex flex-col gap-1"
              >
                <label className="font-manrope text-sm font-semibold text-muted">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/20" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-10 w-full rounded-xl border-1 border-border bg-transparent pl-11 pr-11 font-dm-sans text-sm text-primary shadow-sm placeholder:text-muted focus:outline-none"
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
                {!isSignUp && (
                  <div className="text-right">
                    <Link
                      href="/auth/forgot-password"
                      className="font-dm-sans text-xs font-bold text-muted transition-colors hover:text-secondary"
                    >
                      Forgot password?
                    </Link>
                  </div>
                )}
              </motion.div>
              {isSignUp && (
                <motion.div
                  variants={fieldVariants}
                  className="flex flex-col gap-1"
                >
                  <label className="font-manrope text-sm font-light text-secondary">
                    Confirm Password
                  </label>
                  <div className="relative mx-2">
                    <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/20" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full rounded-xl border-1 border-border bg-transparent py-1 pl-11 pr-11 font-dm-sans text-sm text-primary shadow-sm placeholder:text-muted focus:outline-none"
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
                </motion.div>
              )}
              {!isSignUp && (
                <motion.div
                  variants={fieldVariants}
                  className="flex items-center gap-2.5"
                >
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer rounded border-border accent-secondary"
                  />
                  <label
                    htmlFor="remember-me"
                    className="font-dm-sans text-sm font-semibold text-muted"
                  >
                    Remember Me{" "}
                    <span className="font-dm-sans text-xs font-normal text-muted/60">
                      (save my login credentials)
                    </span>
                  </label>
                </motion.div>
              )}
              <motion.div variants={fieldVariants}>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-10 w-full cursor-pointer items-center justify-center rounded-xl bg-secondary font-dm-sans font-bold text-md text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? isSignUp
                      ? "Signing Up..."
                      : "Signing In..."
                    : isSignUp
                      ? "Sign Up"
                      : "Sign In"}
                </button>
              </motion.div>
              <motion.div
                variants={fieldVariants}
                className="flex items-center gap-3"
              >
                <div className="h-px flex-1 bg-border" />
                <span className="font-manrope text-xs text-muted">or</span>
                <div className="h-px flex-1 bg-border" />
              </motion.div>
              <motion.p
                variants={fieldVariants}
                className="text-center font-dm-sans text-sm text-muted"
              >
                {isSignUp ? (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={switchMode}
                      className="cursor-pointer font-bold text-primary"
                    >
                      Sign In
                    </button>
                  </>
                ) : (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={switchMode}
                      className="cursor-pointer font-bold text-primary"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </motion.p>
              <motion.div variants={fieldVariants}>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-1 border-border bg-transparent font-dm-sans font-bold text-md text-primary shadow-sm"
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
              </motion.div>
            </motion.form>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
