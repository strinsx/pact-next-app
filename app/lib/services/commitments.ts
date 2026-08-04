"use client";

import { createClient } from "@/app/lib/supabase/client";
import { CommitmentType } from "@/app/lib/commitments";

export interface CommitmentRow {
  id: string;
  title: string;
  description: string | null;
  commitment_type: string;
  status: string;
  evaluation_time: string | null;
  commitment_date: string;
  submitted_at: string | null;
}

export interface NewCommitment {
  profileId: string;
  title: string;
  description: string | null;
  commitmentType: CommitmentType;
  scheduleDays: number[];
  scheduledFor: string;
  evaluationTime: string;
}

export const normalizeCommitmentText = (title: string) =>
  title.trim().toLowerCase().replace(/\s+/g, " ");

export const hasDuplicateTitle = (
  commitments: { id: string; title: string }[],
  title: string,
  excludeId?: string
) => {
  const normalized = normalizeCommitmentText(title);
  return commitments.some(
    (c) =>
      c.id !== excludeId && normalizeCommitmentText(c.title) === normalized
  );
};

export const toHHMM = (time?: string | null) => {
  if (!time) return "23:59";
  const parts = time.split(":");
  return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : time;
};

export const isPastEvaluation = (
  commitmentDate: string,
  profileEvaluationTime: string
) => {
  const [hour, minute] = profileEvaluationTime.split(":").map(Number);
  const deadline = new Date(`${commitmentDate}T00:00:00`);
  deadline.setHours(hour, minute, 0, 0);
  return Date.now() > deadline.getTime();
};

export const formatLocalDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

export const nextEvaluationDate = (baseDate: string, evaluationTime: string) => {
  const date = new Date(`${baseDate}T00:00:00`);
  const [hour, minute] = evaluationTime.split(":").map(Number);
  const deadline = new Date(date);
  deadline.setHours(hour || 23, minute || 59, 0, 0);
  if (Date.now() <= deadline.getTime()) return baseDate;
  return formatLocalDate(
    new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
  );
};

export async function listCommitmentsByProfile(profileId: string) {
  const supabase = createClient();
  return supabase
    .from("commitments")
    .select("*")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
}

export async function createCommitment(input: NewCommitment) {
  const supabase = createClient();
  return supabase
    .from("commitments")
    .insert({
      profile_id: input.profileId,
      title: input.title,
      description: input.description,
      commitment_type: input.commitmentType,
      commitment_date: nextEvaluationDate(
        input.commitmentType === "scheduled" && input.scheduledFor
          ? input.scheduledFor
          : formatLocalDate(new Date()),
        input.evaluationTime
      ),
      schedule_days:
        input.commitmentType === "routine" && input.scheduleDays.length > 0
          ? [...input.scheduleDays].sort((a, b) => a - b)
          : null,
      scheduled_for:
        input.commitmentType === "scheduled" ? input.scheduledFor || null : null,
      evaluation_time: input.evaluationTime,
    })
    .select("id, title")
    .single();
}

export async function submitCommitment(id: string, status: string) {
  const supabase = createClient();
  return supabase
    .from("commitments")
    .update({ status, submitted_at: new Date().toISOString() })
    .eq("id", id);
}

export async function updateCommitment(
  id: string,
  title: string,
  description: string,
  evaluationTime: string
) {
  const supabase = createClient();
  return supabase
    .from("commitments")
    .update({
      title,
      description,
      evaluation_time: evaluationTime,
    })
    .eq("id", id);
}

export async function deleteCommitment(id: string) {
  const supabase = createClient();
  return supabase.from("commitments").delete().eq("id", id);
}

export async function getSubmittedCommitmentsBetween(
  profileId: string,
  from: string,
  to: string
) {
  const supabase = createClient();
  return supabase
    .from("commitments")
    .select("submitted_at")
    .eq("profile_id", profileId)
    .eq("status", "submitted")
    .gte("submitted_at", from)
    .lt("submitted_at", to);
}

export interface WeeklyDayBreakdown {
  label: string;
  submitted: number;
  missed: number;
}

const toLocalDateKey = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

export async function getWeeklyCommitmentBreakdown(
  profileId: string,
  from: string
): Promise<WeeklyDayBreakdown[]> {
  const supabase = createClient();
  const { data: rows } = await supabase
    .from("commitments")
    .select("status, commitment_date, evaluation_time, submitted_at")
    .eq("profile_id", profileId);

  const all = (rows ?? []) as {
    status: string;
    commitment_date: string;
    evaluation_time: string | null;
    submitted_at: string | null;
  }[];

  const submittedPerDay = new Map<string, number>();
  const missedPerDay = new Map<string, number>();

  for (const row of all) {
    if (row.status === "submitted" && row.submitted_at) {
      const day = toLocalDateKey(row.submitted_at);
      submittedPerDay.set(day, (submittedPerDay.get(day) ?? 0) + 1);
      continue;
    }

    const effectiveStatus =
      row.status === "pending" &&
      isPastEvaluation(row.commitment_date, toHHMM(row.evaluation_time))
        ? "missed"
        : row.status;

    if (effectiveStatus === "missed") {
      const day = row.commitment_date.slice(0, 10);
      missedPerDay.set(day, (missedPerDay.get(day) ?? 0) + 1);
    }
  }

  const result: WeeklyDayBreakdown[] = [];
  const start = new Date(`${from}T00:00:00`);

  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(day.getDate() + i);
    const key = formatLocalDate(day);
    result.push({
      label: day.toLocaleString("en", { weekday: "short" }),
      submitted: submittedPerDay.get(key) ?? 0,
      missed: missedPerDay.get(key) ?? 0,
    });
  }

  return result;
}

export interface ConsistencyDay {
  date: string;
  value: number;
  submitted: number;
  missed: number;
}

export interface ConsistencyWeek {
  label: string;
  days: ConsistencyDay[];
}

export async function getYearlyConsistency(
  profileId: string,
  weeks = 52
): Promise<ConsistencyWeek[]> {
  const supabase = createClient();
  const { data: rows } = await supabase
    .from("commitments")
    .select("status, commitment_date, evaluation_time")
    .eq("profile_id", profileId);

  const all = (rows ?? []) as {
    status: string;
    commitment_date: string;
    evaluation_time: string | null;
  }[];

  const byDay = new Map<string, { submitted: number; missed: number }>();
  for (const row of all) {
    const effectiveStatus =
      row.status === "pending" &&
      isPastEvaluation(row.commitment_date, toHHMM(row.evaluation_time))
        ? "missed"
        : row.status;

    if (effectiveStatus !== "submitted" && effectiveStatus !== "missed") {
      continue;
    }

    const day = row.commitment_date.slice(0, 10);
    const entry = byDay.get(day) ?? { submitted: 0, missed: 0 };
    if (effectiveStatus === "submitted") entry.submitted += 1;
    else entry.missed += 1;
    byDay.set(day, entry);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  const fmt = (d: Date) =>
    d.toLocaleString("en", { month: "short", day: "numeric" });

  const result: ConsistencyWeek[] = [];

  for (let w = weeks - 1; w >= 0; w--) {
    const weekStart = new Date(currentMonday);
    weekStart.setDate(weekStart.getDate() - w * 7);

    const days: ConsistencyDay[] = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);

      const key = formatLocalDate(day);
      const entry = byDay.get(key);
      const evaluated = entry ? entry.submitted + entry.missed : 0;
      const value =
        evaluated > 0 ? Math.round((entry!.submitted / evaluated) * 100) : 0;

      days.push({
        date: key,
        value,
        submitted: entry?.submitted ?? 0,
        missed: entry?.missed ?? 0,
      });
    }

    result.push({ label: fmt(weekStart), days });
  }

  return result;
}

export interface WeeklyConsistencyDatum {
  label: string;
  value: number;
}

export async function getWeeklyConsistency(
  profileId: string
): Promise<WeeklyConsistencyDatum[]> {
  const supabase = createClient();
  const { data: rows } = await supabase
    .from("commitments")
    .select("status, commitment_date")
    .eq("profile_id", profileId)
    .order("commitment_date", { ascending: true });

  const all = (rows ?? []) as { status: string; commitment_date: string }[];

  if (all.length === 0) return [];

  const anchor = new Date(`${all[0].commitment_date}T00:00:00`);
  anchor.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor((today.getTime() - anchor.getTime()) / 86400000);
  const weekIndex = Math.max(0, Math.floor(daysDiff / 7));

  const weekStart = new Date(anchor);
  weekStart.setDate(weekStart.getDate() + weekIndex * 7);

  const byDay = new Map<string, { done: number; missed: number }>();
  for (const row of all) {
    const day = row.commitment_date.slice(0, 10);
    const entry = byDay.get(day) ?? { done: 0, missed: 0 };
    if (row.status === "submitted") entry.done += 1;
    else if (row.status === "missed") entry.missed += 1;
    byDay.set(day, entry);
  }

  const fmt = (d: Date) =>
    d.toLocaleString("en", { month: "short", day: "numeric" });

  const result: WeeklyConsistencyDatum[] = [];

  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);

    const entry = byDay.get(formatLocalDate(day));
    const evaluated = entry ? entry.done + entry.missed : 0;
    const value =
      evaluated > 0 ? Math.round((entry!.done / evaluated) * 100) : 0;

    result.push({ label: fmt(day), value });
  }

  return result;
}


export interface ProfileStats {
  completionRate: number;
  submittedCount: number;
  dayStreak: number;
}

interface StatsRow {
  status: string;
  commitment_date: string;
  evaluation_time: string | null;
}

function computeProfileStats(all: StatsRow[], asOf: Date): ProfileStats {
  let submittedCount = 0;
  let missedCount = 0;

  const byDay = new Map<
    string,
    { total: number; done: number; hasPending: boolean }
  >();

  for (const row of all) {
    const effectiveStatus =
      row.status === "pending" &&
      isPastEvaluation(row.commitment_date, toHHMM(row.evaluation_time))
        ? "missed"
        : row.status;

    if (effectiveStatus === "submitted") submittedCount += 1;
    else if (effectiveStatus === "missed") missedCount += 1;

    const day = row.commitment_date.slice(0, 10);
    const entry = byDay.get(day) ?? { total: 0, done: 0, hasPending: false };
    entry.total += 1;
    if (effectiveStatus === "submitted") entry.done += 1;
    if (effectiveStatus === "pending") entry.hasPending = true;
    byDay.set(day, entry);
  }

  const evaluated = submittedCount + missedCount;
  const completionRate =
    evaluated > 0 ? Math.round((submittedCount / evaluated) * 100) : 0;

  let dayStreak = 0;
  const cursor = new Date(asOf);
  cursor.setHours(0, 0, 0, 0);

  for (let i = 0; i < 10000; i++) {
    const day = formatLocalDate(cursor);
    const entry = byDay.get(day);

    if (!entry) {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }

    if (entry.done === entry.total) {
      dayStreak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }

    if (entry.hasPending) {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }

    break;
  }

  return { completionRate, submittedCount, dayStreak };
}

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const startOfWeekDate = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
};

function dailyConsistencyAvg(
  all: StatsRow[],
  weekStart: Date
): number {
  const byDay = new Map<string, { done: number; missed: number }>();
  for (const row of all) {
    const day = row.commitment_date.slice(0, 10);
    const entry = byDay.get(day) ?? { done: 0, missed: 0 };
    if (row.status === "submitted") entry.done += 1;
    else if (row.status === "missed") entry.missed += 1;
    byDay.set(day, entry);
  }

  let sum = 0;
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    const entry = byDay.get(formatLocalDate(day));
    const evaluated = entry ? entry.done + entry.missed : 0;
    sum += evaluated > 0 ? entry!.done / evaluated : 0;
  }
  return Math.round((sum / 7) * 100);
}

export interface PeriodStat {
  current: number;
  previous: number;
  delta: number | null;
}

export interface StatsWithDelta {
  overall: ProfileStats;
  completionRate: PeriodStat;
  submittedCount: PeriodStat;
  weekSubmitted: PeriodStat;
  weekAvg: PeriodStat;
}

const pctDelta = (current: number, previous: number): number | null =>
  previous === 0 ? null : Math.round(((current - previous) / previous) * 100);

export async function getProfileStats(
  profileId: string
): Promise<ProfileStats> {
  const supabase = createClient();
  const { data: rows } = await supabase
    .from("commitments")
    .select("status, commitment_date, evaluation_time")
    .eq("profile_id", profileId);

  const all = (rows ?? []) as StatsRow[];
  return computeProfileStats(all, new Date());
}

export async function getStatsWithDelta(
  profileId: string
): Promise<StatsWithDelta> {
  const supabase = createClient();
  const { data: rows } = await supabase
    .from("commitments")
    .select("status, commitment_date, evaluation_time")
    .eq("profile_id", profileId);

  const all = (rows ?? []) as StatsRow[];
  const now = new Date();

  const monday = startOfWeekDate(now);
  const thisWeekFrom = formatLocalDate(monday);
  const thisWeekTo = formatLocalDate(addDays(monday, 7));
  const lastWeekFrom = formatLocalDate(addDays(monday, -7));
  const lastWeekTo = thisWeekFrom;

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const thisMonthFrom = formatLocalDate(thisMonthStart);
  const prevMonthFrom = formatLocalDate(prevMonthStart);
  const thisMonthTo = formatLocalDate(nextMonthStart);

  const inRange = (from: string, to: string) =>
    all.filter(
      (row) =>
        row.commitment_date >= from && row.commitment_date < to
    );

  const thisWeekStats = computeProfileStats(
    inRange(thisWeekFrom, thisWeekTo),
    now
  );
  const lastWeekStats = computeProfileStats(
    inRange(lastWeekFrom, lastWeekTo),
    now
  );
  const thisMonthStats = computeProfileStats(
    inRange(thisMonthFrom, thisMonthTo),
    now
  );
  const lastMonthStats = computeProfileStats(
    inRange(prevMonthFrom, thisMonthFrom),
    now
  );

  return {
    overall: computeProfileStats(all, now),
    completionRate: {
      current: thisWeekStats.completionRate,
      previous: lastWeekStats.completionRate,
      delta: pctDelta(
        thisWeekStats.completionRate,
        lastWeekStats.completionRate
      ),
    },
    submittedCount: {
      current: thisMonthStats.submittedCount,
      previous: lastMonthStats.submittedCount,
      delta: pctDelta(
        thisMonthStats.submittedCount,
        lastMonthStats.submittedCount
      ),
    },
    weekSubmitted: {
      current: thisWeekStats.submittedCount,
      previous: lastWeekStats.submittedCount,
      delta: pctDelta(
        thisWeekStats.submittedCount,
        lastWeekStats.submittedCount
      ),
    },
    weekAvg: {
      current: dailyConsistencyAvg(all, monday),
      previous: dailyConsistencyAvg(all, addDays(monday, -7)),
      delta: pctDelta(
        dailyConsistencyAvg(all, monday),
        dailyConsistencyAvg(all, addDays(monday, -7))
      ),
    },
  };
}
