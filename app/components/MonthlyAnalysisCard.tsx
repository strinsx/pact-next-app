"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import AreaChart from "@/app/components/AreaChart";
import { getCurrentUser } from "@/app/lib/services/auth";
import { getProfileByUserId } from "@/app/lib/services/profile";
import { getSubmittedCommitmentsBetween } from "@/app/lib/services/commitments";

interface DayDatum {
  label: string;
  value: number;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const startOfWeek = () => {
  const now = new Date();
  const diffToMonday = (now.getDay() + 6) % 7;
  const monday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - diffToMonday
  );
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const endOfWeek = (monday: Date) => {
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 7);
  return sunday;
};

export default function DailyCommitmentsCard() {
  const [data, setData] = useState<DayDatum[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDailyData = async () => {
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

      const monday = startOfWeek();
      const sunday = endOfWeek(monday);

      const { data: rows } = await getSubmittedCommitmentsBetween(
        profile.id,
        monday.toISOString(),
        sunday.toISOString()
      );

      const counts = new Array(7).fill(0) as number[];

      for (const row of rows ?? []) {
        if (!row.submitted_at) continue;
        const day = new Date(row.submitted_at);
        const diff = Math.floor(
          (day.getTime() - monday.getTime()) / 86400000
        );
        if (diff >= 0 && diff < 7) {
          counts[diff] += 1;
        }
      }

      setData(
        DAY_LABELS.map((label, i) => ({
          label,
          value: counts[i],
        }))
      );
      setTotal(counts.reduce((sum, count) => sum + count, 0));
      setLoading(false);
    };

    loadDailyData();
  }, []);

  return (
    <div className="w-full flex-1 rounded-2xl border-1 border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-poppins text-xl font-bold text-primary">
          Daily Commitments
        </h2>
        <span className="flex items-center gap-2 rounded-full bg-teal/10 px-3 py-1 font-nunito text-xs font-bold text-teal">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {loading ? "..." : `${total} completed`}
        </span>
      </div>
      <div className="mt-6">
        <AreaChart data={data} from="#38bdf8" to="#a37af7" id="dailyGrad" />
        <div className="mt-2 flex justify-between">
          {DAY_LABELS.map((day) => (
            <span key={day} className="font-nunito text-xs text-muted">
              {day}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
