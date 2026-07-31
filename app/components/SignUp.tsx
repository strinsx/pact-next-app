"use client";

import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="mt-8 font-poppins text-2xl font-bold text-primary">
        Join Your Pact
      </h1>
      <p className="mt-2 font-poppins text-sm font-semibold text-muted">
        Create Your Accountability Group
      </p>
      <div className="mt-8 flex w-full max-w-md flex-col gap-5 rounded-2xl border-1 border-border bg-surface p-8">
        <h2 className="font-poppins text-sm font-light text-secondary">
          Full Name
        </h2>
        <div className="relative mx-2">
          <FontAwesomeIcon
            icon={faUser}
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/20"
          />
          <input
            type="text"
            placeholder="John Doe"
            className="w-full rounded-xl border-1 border-border bg-transparent py-1 pl-11 pr-4 font-nunito text-sm text-primary shadow-sm placeholder:text-muted focus:outline-none"
          />
        </div>
        <h2 className="font-poppins text-sm font-light text-secondary">
          Email Address
        </h2>
        <div className="relative mx-2">
          <FontAwesomeIcon
            icon={faEnvelope}
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/20"
          />
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-xl border-1 border-border bg-transparent py-1 pl-11 pr-4 font-nunito text-sm text-primary shadow-sm placeholder:text-muted focus:outline-none"
          />
        </div>
        <h2 className="font-poppins text-sm font-light text-secondary">
          Password
        </h2>
        <div className="relative mx-2">
          <FontAwesomeIcon
            icon={faLock}
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/20"
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full rounded-xl border-1 border-border bg-transparent py-1 pl-11 pr-11 font-nunito text-sm text-primary shadow-sm placeholder:text-muted focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-muted/30"
          >
            <FontAwesomeIcon
              icon={showPassword ? faEyeSlash : faEye}
              className="h-4 w-4"
            />
          </button>
        </div>
        <h2 className="font-poppins text-sm font-light text-secondary">
          Confirm Password
        </h2>
        <div className="relative mx-2">
          <FontAwesomeIcon
            icon={faLock}
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/20"
          />
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            className="w-full rounded-xl border-1 border-border bg-transparent py-1 pl-11 pr-11 font-nunito text-sm text-primary shadow-sm placeholder:text-muted focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-muted/30"
          >
            <FontAwesomeIcon
              icon={showConfirmPassword ? faEyeSlash : faEye}
              className="h-4 w-4"
            />
          </button>
        </div>
        <button
          type="submit"
          className="mt-2 w-full cursor-pointer rounded-xl bg-secondary py-1 font-nunito font-bold text-md text-white"
        >
          Sign Up
        </button>
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="font-poppins text-xs text-muted">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <button
          type="button"
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
      </div>
      <p className="mt-6 font-nunito text-sm text-muted/50">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-bold text-primary">
          Sign In
        </Link>
      </p>
    </div>
  );
}
