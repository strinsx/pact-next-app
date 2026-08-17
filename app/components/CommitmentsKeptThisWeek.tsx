"use client";

import { CalendarCheck2, CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/app/lib/services/auth";
import { getProfileByUserId } from "@/app/lib/services/profile";
import {
  CommitmentsKeptWeek,
  getCommitmentsKeptThisWeek,
} from "@/app/lib/services/commitments";
import { subscribeDataChanged } from "@/app/lib/events";

export default function CommitmentsKeptThisWeek() {
  const [week, setWeek] = useState<CommitmentsKeptWeek | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWeek = async () => {
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

      setWeek(await getCommitmentsKeptThisWeek(profile.id));
      setLoading(false);
    };

    loadWeek();
    return subscribeDataChanged(loadWeek);
  }, []);

  const days = week?.days ?? [];
  const kept = week?.kept ?? 0;
  const missed = week?.missed ?? 0;
  const evaluated = kept + missed;
  const rate = evaluated > 0 ? Math.round((kept / evaluated) * 100) : 0;

  return (
    <div className="w-full rounded-2xl border-1 border-border bg-surface p-6 text-left">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="font-manrope text-xl font-bold text-primary">
            Commitments Kept This Week
          </h2>
          <p className="mt-1 font-dm-sans text-xs text-muted">
            Every commitment completed or missed across this whole week
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-purple/10 px-3 py-1 font-dm-sans text-xs font-bold text-purple">
          <CalendarCheck2 className="h-3.5 w-3.5" />
          {loading
            ? "..."
            : `${kept} kept · ${missed} missed`}
        </span>
      </div>

      {loading ? (
        <p className="mt-6 text-center font-dm-sans text-sm text-muted">
          Loading weekly commitments...
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {days.map((day) => {
            const total = day.completed + day.missed;
            const pct = total > 0 ? Math.round((day.completed / total) * 100) : 0;
            return (
              <li
                key={day.date}
                className="flex items-center gap-3 rounded-xl border-1 border-border bg-background px-4 py-2.5"
              >
                <span className="w-10 shrink-0 font-dm-sans text-sm font-bold text-primary">
                  {day.label}
                </span>
                <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-border">
                  <div
                    className={`h-full rounded-full ${
                      pct > 0
                        ? "bg-gradient-to-r from-sky-400 to-purple"
                        : "bg-border"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="flex w-14 shrink-0 items-center justify-end gap-1 font-dm-sans text-xs font-semibold text-teal">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {day.completed}
                </span>
                <span className="flex w-14 shrink-0 items-center justify-end gap-1 font-dm-sans text-xs font-semibold text-red-500">
                  <XCircle className="h-3.5 w-3.5" />
                  {day.missed}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {!loading && evaluated === 0 && (
        <p className="mt-4 text-center font-dm-sans text-xs text-muted/70">
          Nothing evaluated yet this week - submit or confirm a commitment to
          start tracking.
        </p>
      )}

      {!loading && evaluated > 0 && (
        <p className="mt-4 text-center font-dm-sans text-xs text-muted">
          {rate}% of this week&apos;s commitments kept
        </p>
      )}
    </div>
  );
}