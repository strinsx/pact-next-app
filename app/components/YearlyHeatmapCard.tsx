"use client";

import { Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/app/lib/services/auth";
import { getProfileByUserId } from "@/app/lib/services/profile";
import {
  ConsistencyDay,
  ConsistencyWeek,
  getYearlyConsistency,
} from "@/app/lib/services/commitments";
import { subscribeDataChanged } from "@/app/lib/events";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const ROW_LABELS: Record<number, string> = {
  0: "Mon",
  2: "Wed",
  4: "Fri",
};

const monthShort = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleString("en", { month: "short" });

const formatTooltipDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

interface TooltipState {
  day: ConsistencyDay;
  x: number;
  y: number;
}

export default function YearlyHeatmapCard() {
  const [weeks, setWeeks] = useState<ConsistencyWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  useEffect(() => {
    const loadYearly = async () => {
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

      setWeeks(await getYearlyConsistency(profile.id));
      setLoading(false);
    };

    loadYearly();
    return subscribeDataChanged(loadYearly);
  }, []);

  const monthLabels = weeks.map((week, i) => {
    const month = monthShort(week.days[0].date);
    if (i === 0) return month;
    return month === monthShort(weeks[i - 1].days[0].date) ? "" : month;
  });

  const avg =
    weeks.length > 0
      ? (() => {
          const submitted = weeks.reduce(
            (sum, week) =>
              sum + week.days.reduce((s, d) => s + d.submitted, 0),
            0
          );
          const evaluated = weeks.reduce(
            (sum, week) =>
              sum + week.days.reduce((s, d) => s + d.submitted + d.missed, 0),
            0
          );
          return evaluated > 0 ? Math.round((submitted / evaluated) * 100) : 0;
        })()
      : 0;

  return (
    <div className="w-full flex-1 rounded-2xl border-1 border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-poppins text-xl font-bold text-primary">
          Yearly Contributions
        </h2>
        <span className="flex items-center gap-2 rounded-full bg-purple/10 px-3 py-1 font-nunito text-xs font-bold text-purple">
          <Flame className="h-3.5 w-3.5" />
          {loading ? "..." : `${avg}% avg`}
        </span>
      </div>
      <p className="mt-1 text-left font-nunito text-xs text-muted/70">
        Daily completion rate over the last {weeks.length || 52} weeks
      </p>
      <div className="mt-6 overflow-x-auto">
        <div className="w-fit">
          <div className="flex gap-1">
            <div className="w-10 shrink-0" />
            {monthLabels.map((month, i) => (
              <div
                key={i}
                className="w-3.5 shrink-0 text-left font-nunito text-[10px] leading-3 text-muted"
              >
                {month}
              </div>
            ))}
          </div>
          <div className="mt-1 flex flex-col gap-1">
            {DAY_LABELS.map((dayLabel, row) => (
              <div key={dayLabel} className="flex items-center gap-1">
                <div className="w-10 shrink-0 text-right font-nunito text-[10px] leading-3 text-muted">
                  {ROW_LABELS[row] ?? ""}
                </div>
                {weeks.map((week) => {
                  const day = week.days[row];
                  return (
                    <div
                      key={day.date}
                      onMouseEnter={(e) =>
                        setTooltip({
                          day,
                          x: e.clientX,
                          y: e.clientY,
                        })
                      }
                      onMouseMove={(e) =>
                        setTooltip((prev) =>
                          prev && prev.day.date === day.date
                            ? { ...prev, x: e.clientX, y: e.clientY }
                            : prev
                        )
                      }
                      onMouseLeave={() => setTooltip(null)}
                      className="h-3.5 w-3.5 shrink-0 cursor-default rounded-[3px] transition-transform hover:scale-125"
                      style={{
                        background: `color-mix(in srgb, var(--color-purple) ${day.value}%, var(--color-border))`,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-1.5">
        <span className="font-nunito text-xs text-muted">Less</span>
        {[0, 25, 50, 75, 100].map((step) => (
          <div
            key={step}
            className="h-3 w-3 rounded-[3px]"
            style={{
              background: `color-mix(in srgb, var(--color-purple) ${step}%, var(--color-border))`,
            }}
          />
        ))}
        <span className="font-nunito text-xs text-muted">More</span>
      </div>
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 rounded-lg border-1 border-border bg-surface px-3 py-2 text-center shadow-xl"
          style={{
            left: Math.min(tooltip.x, window.innerWidth - 80),
            top: Math.max(tooltip.y - 56, 8),
          }}
        >
          <span className="block whitespace-nowrap font-nunito text-xs font-bold text-primary">
            {formatTooltipDate(tooltip.day.date)}
          </span>
          <span className="block whitespace-nowrap font-nunito text-xs text-muted">
            {tooltip.day.submitted + tooltip.day.missed > 0
              ? `${tooltip.day.value}% completed`
              : "No commitments"}
          </span>
        </div>
      )}
    </div>
  );
}
