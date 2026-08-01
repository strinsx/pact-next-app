"use client";

import { Flame } from "lucide-react";
import { useSyncExternalStore } from "react";
import AreaChart from "@/app/components/AreaChart";

const values = [72, 84, 65, 91];

const emptySubscribe = () => () => {};

let cachedLabels: string[] | null = null;

function getWeekLabels(): string[] {
  if (cachedLabels) return cachedLabels;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const days = [1, 8, 15, now.getDate()];

  cachedLabels = days.map((day) => {
    const d = new Date(year, month, day);
    const monthName = d.toLocaleString("en", { month: "short" });
    return `${monthName} ${d.getDate()}`;
  });

  return cachedLabels;
}

export default function WeeklyConsistencyCard() {
  const labels = useSyncExternalStore(emptySubscribe, getWeekLabels, () => []);

  const weeklyData = values.map((value, i) => ({
    label: labels[i] ?? "",
    value,
  }));

  return (
    <div className="w-full flex-1 rounded-2xl border-1 border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-poppins text-xl font-bold text-primary">
          Weekly Consistency
        </h2>
        <span className="flex items-center gap-2 rounded-full bg-purple/10 px-3 py-1 font-nunito text-xs font-bold text-purple">
          <Flame className="h-3.5 w-3.5" />
          78% avg
        </span>
      </div>
      <div className="mt-6">
        <AreaChart
          data={weeklyData}
          from="#56d9c8"
          to="#4a90f5"
          id="weeklyGrad"
        />
        <div className="mt-2 flex justify-between">
          {weeklyData.map((week) => (
            <span key={week.label} className="font-nunito text-xs text-muted">
              {week.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
