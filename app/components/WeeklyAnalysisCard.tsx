"use client";

import { Flame } from "lucide-react";
import { useEffect, useState } from "react";
import AreaChart from "@/app/components/AreaChart";
import { getCurrentUser } from "@/app/lib/services/auth";
import { getProfileByUserId } from "@/app/lib/services/profile";
import {
  getWeeklyConsistency,
  WeeklyConsistencyDatum,
} from "@/app/lib/services/commitments";

export default function WeeklyConsistencyCard() {
  const [data, setData] = useState<WeeklyConsistencyDatum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWeekly = async () => {
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

      setData(await getWeeklyConsistency(profile.id));
      setLoading(false);
    };

    loadWeekly();
  }, []);

  const avg =
    data.length > 0
      ? Math.round(
          data.reduce((sum, d) => sum + d.value, 0) / data.length
        )
      : 0;

  return (
    <div className="w-full flex-1 rounded-2xl border-1 border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-poppins text-xl font-bold text-primary">
          Weekly Consistency
        </h2>
        <span className="flex items-center gap-2 rounded-full bg-purple/10 px-3 py-1 font-nunito text-xs font-bold text-purple">
          <Flame className="h-3.5 w-3.5" />
          {loading ? "..." : `${avg}% avg`}
        </span>
      </div>
      <div className="mt-6">
        <AreaChart
          data={data}
          from="#56d9c8"
          to="#4a90f5"
          id="weeklyGrad"
        />
        <div className="mt-2 flex justify-between">
          {data.map((week) => (
            <span key={week.label} className="font-nunito text-xs text-muted">
              {week.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
