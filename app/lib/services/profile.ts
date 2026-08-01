"use client";

import { createClient } from "@/app/lib/supabase/client";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  username: string | null;
  evaluation_time: string | null;
}

export async function getProfileByUserId<T = Profile>(
  userId: string,
  columns = "*"
): Promise<{ data: T | null; error: { message: string } | null }> {
  const supabase = createClient();
  const result = await supabase
    .from("profiles")
    .select(columns)
    .eq("user_id", userId)
    .maybeSingle();
  return result as { data: T | null; error: { message: string } | null };
}

export async function createProfile(userId: string, fullName: string | null) {
  const supabase = createClient();
  return supabase.from("profiles").insert({
    id: crypto.randomUUID(),
    user_id: userId,
    full_name: fullName,
  });
}

export async function updateUsername(userId: string, username: string) {
  const supabase = createClient();
  return supabase
    .from("profiles")
    .update({ username })
    .eq("user_id", userId);
}

export async function updateEvaluationTime(
  userId: string,
  evaluationTime: string
) {
  const supabase = createClient();
  return supabase
    .from("profiles")
    .update({ evaluation_time: evaluationTime })
    .eq("user_id", userId);
}
