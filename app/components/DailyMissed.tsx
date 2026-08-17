"use client";

import Image from "next/image";
import { XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/app/lib/services/auth";
import { getProfileByUserId } from "@/app/lib/services/profile";
import { getTodayDailyStatus } from "@/app/lib/services/commitments";
import { subscribeDataChanged } from "@/app/lib/events";

export default function DailyMissed() {
  const [missed, setMissed] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const user = await getCurrentUser();
      if (!user) return;

      const { data: profile } = await getProfileByUserId(user.id, "id");
      if (!profile) return;

      const status = await getTodayDailyStatus(profile.id);
      setMissed(status.missed);
    };

    load();
    return subscribeDataChanged(load);
  }, []);

  return (
    <div className="relative flex flex-1 w-full flex-col overflow-hidden rounded-md border-1 border-border bg-surface p-5 text-left">
      <div className="relative z-10 flex flex-col gap-2">
        <XCircle className="h-5 w-5 text-red-500" />
        <span className="bg-gradient-to-r from-red-400 to-red-500 bg-clip-text font-manrope text-3xl font-bold text-transparent">
          {missed === null ? "..." : missed}
        </span>
        <span className="font-dm-sans text-sm font-semibold text-muted">
          Daily Missed
        </span>
      </div>
      <Image
        src="/missed.png"
        alt=""
        width={1000}
        height={80}
        className="pointer-events-none absolute right-0 top-0 z-0 h-full w-1/2 object-cover opacity-30"
      />
    </div>
  );
}