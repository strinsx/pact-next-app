"use client";

import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/app/lib/services/auth";
import { getProfileByUserId } from "@/app/lib/services/profile";
import { getTodayDailyStatus } from "@/app/lib/services/commitments";
import { subscribeDataChanged } from "@/app/lib/events";

export default function DailyCompleted() {
  const [completed, setCompleted] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const user = await getCurrentUser();
      if (!user) return;

      const { data: profile } = await getProfileByUserId(user.id, "id");
      if (!profile) return;

      const status = await getTodayDailyStatus(profile.id);
      setCompleted(status.completed);
    };

    load();
    return subscribeDataChanged(load);
  }, []);

  return (
<div className="relative flex flex-1 w-full flex-col overflow-hidden rounded-md border-1 border-border bg-surface p-5 text-left">
      <div className="relative z-10 flex flex-col gap-2">
        <CheckCircle2 className="h-5 w-5 text-teal" />
        <span className="bg-gradient-to-r from-teal to-secondary bg-clip-text font-manrope text-3xl font-bold text-transparent">
          {completed === null ? "..." : completed}
        </span>
        <span className="font-dm-sans text-sm font-semibold text-muted">
          Daily Completed
        </span>
      </div>
      <Image
        src="/completed.png"
        alt=""
        width={1000}
        height={80}
        className="pointer-events-none absolute right-0 top-0 z-0 h-full w-1/2 object-cover opacity-30"
      />
    </div>
  );
}