"use client";

import { Flame } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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

const WEEKS_TOTAL = 52;
const CELL_WIDTH = 14;
const CELL_GAP = 4;
const LABEL_COL = 40;
const DEFAULT_VISIBLE_WEEKS = 26;

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

let cachedCardWidth = 0;
const widthListeners = new Set<() => void>();

function emitWidthChange() {
  widthListeners.forEach((listener) => listener());
}

function subscribeToWidth(onChange: () => void) {
  widthListeners.add(onChange);
  return () => {
    widthListeners.delete(onChange);
  };
}

function getCardWidth() {
  return cachedCardWidth;
}

export default function YearlyHeatmapCard() {
  const [weeks, setWeeks] = useState<ConsistencyWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardWidth = useSyncExternalStore(
    subscribeToWidth,
    getCardWidth,
    getCardWidth
  );

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const update = () => {
      const width = el.getBoundingClientRect().width;
      if (cachedCardWidth !== width) {
        cachedCardWidth = width;
        emitWidthChange();
      }
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

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

      setWeeks(await getYearlyConsistency(profile.id, WEEKS_TOTAL));
      setLoading(false);
    };

    loadYearly();
    return subscribeDataChanged(loadYearly);
  }, []);

  const visibleCount =
    cardWidth <= 0
      ? DEFAULT_VISIBLE_WEEKS
      : Math.max(
          2,
          Math.floor((cardWidth - LABEL_COL - 4) / (CELL_WIDTH + CELL_GAP))
        );
  const visibleWeeks =
    weeks.length > visibleCount ? weeks.slice(weeks.length - visibleCount) : weeks;

  const monthLabels = visibleWeeks.map((week, i) => {
    const month = monthShort(week.days[0].date);
    if (i === 0) return month;
    return month === monthShort(visibleWeeks[i - 1].days[0].date) ? "" : month;
  });

  const avg =
    visibleWeeks.length > 0
      ? (() => {
          const submitted = visibleWeeks.reduce(
            (sum, week) =>
              sum + week.days.reduce((s, d) => s + d.submitted, 0),
            0
          );
          const evaluated = visibleWeeks.reduce(
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
        <h2 className="font-manrope text-xl font-bold text-primary">
          Yearly Contributions
        </h2>
        <span className="flex items-center gap-2 rounded-full bg-purple/10 px-3 py-1 font-dm-sans text-xs font-bold text-purple">
          <Flame className="h-3.5 w-3.5" />
          {loading ? "..." : `${avg}% avg`}
        </span>
      </div>
      <p className="mt-1 text-left font-dm-sans text-xs text-muted/70">
        Daily completion rate over the last {visibleWeeks.length || WEEKS_TOTAL}{" "}
        weeks
      </p>
      <div className="mt-6 overflow-hidden" ref={contentRef}>
        <div className="flex gap-1">
          <div className="w-10 shrink-0" />
          {monthLabels.map((month, i) => (
            <div
              key={i}
              className="w-3.5 shrink-0 text-left font-dm-sans text-[10px] leading-3 text-muted"
            >
              {month}
            </div>
          ))}
        </div>
        <div className="mt-1 flex flex-col gap-1">
          {DAY_LABELS.map((dayLabel, row) => (
            <div key={dayLabel} className="flex items-center gap-1">
              <div className="w-10 shrink-0 text-right font-dm-sans text-[10px] leading-3 text-muted">
                {ROW_LABELS[row] ?? ""}
              </div>
              {visibleWeeks.map((week) => {
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
      <div className="mt-4 flex items-center justify-end gap-1.5">
        <span className="font-dm-sans text-xs text-muted">Less</span>
        {[0, 25, 50, 75, 100].map((step) => (
          <div
            key={step}
            className="h-3 w-3 rounded-[3px]"
            style={{
              background: `color-mix(in srgb, var(--color-purple) ${step}%, var(--color-border))`,
            }}
          />
        ))}
        <span className="font-dm-sans text-xs text-muted">More</span>
      </div>
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 rounded-lg border-1 border-border bg-surface px-3 py-2 text-center shadow-xl"
          style={{
            left: Math.min(tooltip.x, window.innerWidth - 80),
            top: Math.max(tooltip.y - 56, 8),
          }}
        >
          <span className="block whitespace-nowrap font-dm-sans text-xs font-bold text-primary">
            {formatTooltipDate(tooltip.day.date)}
          </span>
          <span className="block whitespace-nowrap font-dm-sans text-xs text-muted">
            {tooltip.day.submitted + tooltip.day.missed > 0
              ? `${tooltip.day.value}% completed`
              : "No commitments"}
          </span>
        </div>
      )}
    </div>
  );
}
