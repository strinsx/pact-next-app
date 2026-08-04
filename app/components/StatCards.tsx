"use client";

import { Target, ClipboardCheck, Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/app/lib/services/auth";
import { getProfileByUserId } from "@/app/lib/services/profile";
import { getProfileStats, ProfileStats } from "@/app/lib/services/commitments";
import { subscribeDataChanged } from "@/app/lib/events";

export default function StatCards() {
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const user = await getCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await getProfileByUserId(user.id, "id");

      if (!profile) {
        setLoading(false);
        return;
      }

      setStats(await getProfileStats(profile.id));
      setLoading(false);
    };

    loadStats();
    return subscribeDataChanged(loadStats);
  }, []);

  const statItems = [
    {
      label: "Completion Rate",
      value: loading ? "..." : stats ? `${stats.completionRate}%` : "0%",
      icon: Target,
    },
    {
      label: "Commitments Submitted",
      value: loading ? "..." : stats ? String(stats.submittedCount) : "0",
      icon: ClipboardCheck,
    },
    {
      label: "Day Streak",
      value: loading ? "..." : stats ? String(stats.dayStreak) : "0",
      icon: Flame,
    },
  ];

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <h2 className="self-start font-poppins text-xl font-bold text-primary">
        Your Personal Stats
      </h2>
      <div className="flex flex-wrap justify-center gap-6">
        {statItems.map((stat) => (
          <div
            key={stat.label}
            className="flex w-100 flex-col gap-2 rounded-2xl border-1 border-border bg-surface p-6 text-left"
          >
            <stat.icon className="h-5 w-5 text-muted" />
            <span className="bg-gradient-to-r from-purple to-secondary bg-clip-text font-poppins text-3xl font-bold text-transparent">
              {stat.value}
            </span>
            <span className="font-nunito text-sm text-muted">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
