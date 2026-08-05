"use client";

import { createClient } from "@/app/lib/supabase/client";

export interface FeedComment {
  id: string;
  commitment_id: string;
  profile_id: string;
  text: string;
  created_at: string;
  name: string;
}

export async function getCommentsForCommitments(
  commitmentIds: string[]
): Promise<FeedComment[]> {
  if (commitmentIds.length === 0) return [];

  const supabase = createClient();

  const { data } = await supabase
    .from("comments")
    .select(
      "id, commitment_id, profile_id, comment, created_at, profiles(username, full_name)"
    )
    .in("commitment_id", commitmentIds)
    .order("created_at", { ascending: true });

  interface CommentRow {
    id: string;
    commitment_id: string;
    profile_id: string;
    comment: string;
    created_at: string;
    profiles:
      | { username: string | null; full_name: string | null }
      | { username: string | null; full_name: string | null }[]
      | null;
  }

  const rows = (data ?? []) as CommentRow[];

  return rows.map((row) => {
    const profile = Array.isArray(row.profiles)
      ? row.profiles[0]
      : row.profiles;

    const name =
      profile?.username ??
      profile?.full_name?.trim().split(/\s+/)[0] ??
      "Member";

    return {
      id: row.id,
      commitment_id: row.commitment_id,
      profile_id: row.profile_id,
      text: row.comment,
      created_at: row.created_at,
      name,
    };
  });
}

export async function addComment(
  commitmentId: string,
  profileId: string,
  text: string
) {
  const supabase = createClient();
  return supabase
    .from("comments")
    .insert({
      commitment_id: commitmentId,
      profile_id: profileId,
      comment: text,
    })
    .select("id")
    .single();
}
