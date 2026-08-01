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
  const diffToMonday = (now.getDay() + 6) % 7;
  const thisMonday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - diffToMonday
  );

  const fmt = (d: Date) =>
    d.toLocaleString("en", { month: "short", day: "numeric" });

  cachedLabels = [3, 2, 1, 0].map((offset) => {
    const monday = new Date(
      thisMonday.getFullYear(),
      thisMonday.getMonth(),
      thisMonday.getDate() - offset * 7
    );
    const sunday = new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate() + 6
    );
    return `${fmt(monday)} – ${fmt(sunday)}`;
  });

  return cachedLabels;
}

export default function WeeklyConsistencyCard() {
  const labels = useSyncExternalStore(emptySubscribe, getWeekLabels, () => []);

  const weeklyData = labels.map((label, i) => ({
    label,
    value: values[i] ?? 0,
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
