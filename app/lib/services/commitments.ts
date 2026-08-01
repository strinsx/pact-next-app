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
