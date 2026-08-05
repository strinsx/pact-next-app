"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/app/lib/services/auth";
import { getProfileByUserId } from "@/app/lib/services/profile";
import {
  getWeeklyCommitmentBreakdown,
  formatLocalDate,
  WeeklyDayBreakdown,
} from "@/app/lib/services/commitments";
import { subscribeDataChanged } from "@/app/lib/events";

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

export default function DailyCommitmentsCard() {
  const [data, setData] = useState<WeeklyDayBreakdown[]>([]);
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
      const breakdown = await getWeeklyCommitmentBreakdown(
        profile.id,
        formatLocalDate(monday)
      );

      setData(breakdown);
      setTotal(breakdown.reduce((sum, d) => sum + d.submitted, 0));
      setLoading(false);
    };

    loadDailyData();
    return subscribeDataChanged(loadDailyData);
  }, []);

  return (    <div className="w-full flex-1 rounded-2xl border-1 border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-poppins text-xl font-bold text-primary">
          Daily Commitments
        </h2>
        <span className="flex items-center gap-2 rounded-full bg-teal/10 px-3 py-1 font-nunito text-xs font-bold text-teal">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {loading ? "..." : `${total} completed`}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-4">
        <span className="flex items-center gap-1.5 font-nunito text-xs text-muted">
          <span className="h-2.5 w-2.5 rounded-sm bg-teal" />
          Submitted
        </span>
        <span className="flex items-center gap-1.5 font-nunito text-xs text-muted">
          <span className="h-2.5 w-2.5 rounded-sm bg-red-500" />
          Missed
        </span>
        <span className="flex items-center gap-1.5 font-nunito text-xs text-muted">
          <span className="h-2.5 w-2.5 rounded-sm bg-purple" />
          Pending
        </span>
      </div>
      <div className="mt-4 flex items-end gap-3">
        {data.map((day) => {
          const totalDay = day.submitted + day.missed + day.pending;
          return (
            <div
              key={day.label}
              className="group relative flex flex-1 flex-col items-center gap-2"
            >
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border-1 border-border bg-surface px-3 py-2 text-left shadow-xl group-hover:block">
                <p className="font-nunito text-xs font-bold text-primary">
                  {day.label}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 font-nunito text-xs text-muted">
                  <span className="h-2 w-2 rounded-sm bg-teal" />
                  {day.submitted} completed
                </p>
                <p className="flex items-center gap-1.5 font-nunito text-xs text-muted">
                  <span className="h-2 w-2 rounded-sm bg-red-500" />
                  {day.missed} missed
                </p>
                <p className="flex items-center gap-1.5 font-nunito text-xs text-muted">
                  <span className="h-2 w-2 rounded-sm bg-purple" />
                  {day.pending} pending
                </p>
              </div>
              <div className="flex h-36 w-10 flex-col justify-end overflow-hidden rounded-lg bg-border/30 shadow-[0_0_0_rgba(86,217,200,0)] transition-shadow duration-300 group-hover:shadow-[0_0_20px_rgba(86,217,200,0.6)]">
                {totalDay > 0 && (
                  <>
                    <div
                      style={{
                        height: `${(day.submitted / totalDay) * 100}%`,
                      }}
                      className="w-full bg-teal"
                    />
                    <div
                      style={{
                        height: `${(day.missed / totalDay) * 100}%`,
                      }}
                      className="w-full bg-red-500"
                    />
                    <div
                      style={{
                        height: `${(day.pending / totalDay) * 100}%`,
                      }}
                      className="w-full bg-purple"
                    />
                  </>
                )}
              </div>
              <span className="font-nunito text-xs text-muted">
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
