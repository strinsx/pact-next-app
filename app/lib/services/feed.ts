"use client";

import { createClient } from "@/app/lib/supabase/client";
import { getMyGroups } from "@/app/lib/services/groups";

export type FeedPostType = "created" | "submitted";

export interface FeedPost {
  id: string;
  group: string;
  name: string;
  content: string;
  time: string;
  type: FeedPostType;
}

export interface FeedPostEvent {
  profileId: string;
  commitmentId: string;
  title: string;
  type: FeedPostType;
}

export async function postCommitmentToFeed(event: FeedPostEvent) {
  const groups = await getMyGroups(event.profileId);
  if (groups.length === 0) return;

  const supabase = createClient();
  const content =
    event.type === "created"
      ? `created a commitment "${event.title}"`
      : `completed "${event.title}"`;

  await supabase.from("feed_posts").insert(
    groups.map((group) => ({
      group_id: group.id,
      profile_id: event.profileId,
      commitment_id: event.commitmentId,
      type: event.type,
      content,
    }))
  );
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en", { month: "short", day: "numeric" });
}

export async function getGroupFeed(profileId: string): Promise<FeedPost[]> {
  const groups = await getMyGroups(profileId);
  if (groups.length === 0) return [];

  const supabase = createClient();
  const { data } = await supabase
    .from("feed_posts")
    .select(
      "id, group_id, profile_id, commitment_id, type, content, created_at, groups(name), profiles(username, full_name)"
    )
    .in(
      "group_id",
      groups.map((g) => g.id)
    )
    .order("created_at", { ascending: false });

  interface FeedRow {
    id: string;
    type: string;
    content: string;
    created_at: string;
    groups: { name: string } | { name: string }[] | null;
    profiles:
      | { username: string | null; full_name: string | null }
      | { username: string | null; full_name: string | null }[]
      | null;
  }

  const rows = (data ?? []) as FeedRow[];

  const posts: FeedPost[] = rows.map((row) => {
    const group = Array.isArray(row.groups) ? row.groups[0] : row.groups;
    const groupName = group?.name ?? "";

    const profile = Array.isArray(row.profiles)
      ? row.profiles[0]
      : row.profiles;

    const name =
      profile?.username ??
      profile?.full_name?.trim().split(/\s+/)[0] ??
      "Member";

    return {
      id: row.id,
      group: groupName,
      name,
      content: row.content,
      time: formatTime(row.created_at),
      type: row.type as FeedPostType,
    };
  });

  return posts;
}
