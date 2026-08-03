"use client";

import { createClient } from "@/app/lib/supabase/client";

export interface NewGroup {
  ownerId: string;
  name: string;
  description: string | null;
  maxMembers: number;
  evaluationTime: string;
}

export interface CreatedGroup {
  id: string;
  name: string;
  invite_code: string;
}

export async function createGroup(input: NewGroup) {
  const supabase = createClient();
  return supabase
    .from("groups")
    .insert({
      owner_id: input.ownerId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      invite_code: crypto
        .randomUUID()
        .replace(/-/g, "")
        .slice(0, 8)
        .toUpperCase(),
      max_members: input.maxMembers,
      evaluation_time: input.evaluationTime,
    })
    .select("id, name, invite_code")
    .single();
}
