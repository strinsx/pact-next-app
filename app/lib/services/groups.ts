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

export interface JoinedGroup {
  id: string;
  name: string;
  invite_code: string;
}

export interface PendingJoinRequest {
  id: string;
  joined_at: string;
  profiles: { full_name: string | null } | null;
}

export interface MyGroup {
  id: string;
  name: string;
}

export async function getMyGroups(profileId: string) {
  const supabase = createClient();

  const { data: owned } = await supabase
    .from("groups")
    .select("id, name")
    .eq("owner_id", profileId);

  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id, groups(name)")
    .eq("profile_id", profileId)
    .eq("status", "approved");

  const map = new Map<string, string>();

  for (const group of owned ?? []) {
    map.set(group.id, group.name);
  }

  for (const membership of memberships ?? []) {
    const embedded = Array.isArray(membership.groups)
      ? membership.groups[0] ?? null
      : membership.groups;
    if (embedded?.name) {
      map.set(membership.group_id, embedded.name);
    }
  }

  return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
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

export interface GroupOverview {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  max_members: number;
  memberCount: number;
  pendingCount: number;
  roles: { role: string; count: number }[];
}

export async function joinGroupByInviteCode(
  inviteCode: string,
  profileId: string
) {
  const supabase = createClient();

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("id, name, invite_code, max_members, owner_id")
    .eq("invite_code", inviteCode)
    .maybeSingle();

  if (groupError) {
    return { data: null, error: { message: groupError.message } };
  }

  if (!group) {
    return {
      data: null,
      error: { message: "No group found with that invite code." },
    };
  }

  if (group.owner_id === profileId) {
    return {
      data: null,
      error: { message: "You have already joined this group. You are the owner." },
    };
  }

  const { data: existing } = await supabase
    .from("group_members")
    .select("status")
    .eq("group_id", group.id)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (existing) {
    return {
      data: null,
      error: {
        message:
          existing.status === "approved"
            ? "You're already a member of this group."
            : "Your request to join this group is already pending.",
      },
    };
  }

  const { error: insertError } = await supabase
    .from("group_members")
    .insert({
      group_id: group.id,
      profile_id: profileId,
      role: "member",
      status: "pending",
    });

  if (insertError) {
    return { data: null, error: { message: insertError.message } };
  }

  return {
    data: {
      id: group.id,
      name: group.name,
      invite_code: group.invite_code,
    },
    error: null,
  };
}

export async function getPendingJoinRequests(groupId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("group_members")
    .select("id, joined_at, profiles(full_name)")
    .eq("group_id", groupId)
    .eq("status", "pending")
    .order("joined_at", { ascending: true });

  if (error) {
    return { data: null, error: { message: error.message } };
  }

  const pending: PendingJoinRequest[] = (data ?? []).map((row) => {
    const embedded = Array.isArray(row.profiles)
      ? row.profiles[0] ?? null
      : row.profiles;
    return {
      id: row.id,
      joined_at: row.joined_at,
      profiles: embedded ? { full_name: embedded.full_name ?? null } : null,
    };
  });

  return { data: pending, error: null };
}

export async function getMyGroupOverview(profileId: string) {
  const supabase = createClient();

  const { data: group } = await supabase
    .from("groups")
    .select("id, name, description, invite_code, max_members")
    .eq("owner_id", profileId)
    .maybeSingle();

  if (!group) return null;

  const { data: members } = await supabase
    .from("group_members")
    .select("role, status")
    .eq("group_id", group.id);

  const approved = (members ?? []).filter((m) => m.status === "approved");

  const roleCounts: Record<string, number> = {};
  for (const member of approved) {
    roleCounts[member.role] = (roleCounts[member.role] ?? 0) + 1;
  }

  return {
    ...group,
    memberCount: approved.length,
    pendingCount: (members ?? []).filter((m) => m.status === "pending").length,
    roles: Object.entries(roleCounts).map(([role, count]) => ({ role, count })),
  };
}
