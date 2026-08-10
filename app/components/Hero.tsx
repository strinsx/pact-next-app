"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import HeroBadge from "@/app/components/HeroBadge";
import JoinedBy from "@/app/components/JoinedBy";
import MiniGroupFeedback from "@/app/components/MiniGroupFeedback";

export default function Hero() {
  const startDark = () => {
    document.documentElement.classList.add("dark");
  };

  const endDark = () => {
    document.documentElement.classList.remove("dark");
  };

  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-6 py-16 lg:py-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <div className="flex flex-col items-start gap-6">
            <HeroBadge />

            <div className="flex flex-col gap-6">
              <h1 className="font-poppins text-5xl font-extrabold leading-[1.1] text-primary lg:text-6xl">
                Say it. Show up.{" "}
                <span className="line-clamp-2 bg-gradient-to-r from-sky-400 to-purple bg-clip-text text-transparent">
                  Keep your word.
                </span>
              </h1>

              <p className="max-w-lg font-nunito text-lg leading-relaxed text-muted">
                Pact turns your goals into daily commitments &mdash; made in the
                open, reported to a small group who actually expect you to follow
                through.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/auth/signup"
                  onMouseEnter={startDark}
                  onMouseLeave={endDark}
                  className="rounded-full bg-gradient-to-r from-sky-400 to-purple px-7 py-3 font-nunito text-sm font-bold text-white transition-all delay-300 duration-300 hover:translate-x-[8px] hover:opacity-90"
                >
                  Start your pact
                </Link>
                <Link
                  href="#how-it-works"
                  className="flex items-center gap-2 rounded-lg border-1 border-border bg-surface px-7 py-3 font-nunito text-sm font-bold text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white"
                >
                  <Play className="h-4 w-4" />
                  See how it works
                </Link>
              </div>

              <JoinedBy />
            </div>
          </div>

          <MiniGroupFeedback />
        </div>
      </section>
    </>
  );
}
