"use client";

import { Crown, ShieldCheck, User, UserMinus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { getCurrentUser } from "@/app/lib/services/auth";
import { getProfileByUserId } from "@/app/lib/services/profile";
import {
  getMyGroupOverview,
  getGroupMembers,
  kickMember,
} from "@/app/lib/services/groups";

type Role = "Owner" | "Admin" | "Member";

interface Member {
  id: string;
  profile_id: string;
  name: string;
  username: string;
  role: Role;
}

const roleStyles = {
  Owner: "bg-gradient-to-r from-sky-400 to-purple text-white",
  Admin: "bg-secondary/10 text-secondary",
  Member: "bg-border/50 text-muted",
} as const;

const roleIcons = {
  Owner: Crown,
  Admin: ShieldCheck,
  Member: User,
} as const;

const toRole = (role: string): Role =>
  role === "owner" ? "Owner" : role === "admin" ? "Admin" : "Member";

export default function MembersCard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [kicking, setKicking] = useState(false);
  const [confirmMember, setConfirmMember] = useState<Member | null>(null);

  useEffect(() => {
    let cancelled = false;
    let groupId: string | null = null;

    const load = async () => {
      const user = await getCurrentUser();
      if (!user) {
        if (!cancelled) setLoading(false);
        return;
      }

      const { data: profile } = await getProfileByUserId(user.id, "id");
      if (!profile) {
        if (!cancelled) setLoading(false);
        return;
      }

      const group = await getMyGroupOverview(profile.id);

      if (!group) {
        if (!cancelled) {
          setMembers([]);
          setIsOwner(false);
          setLoading(false);
        }
        return;
      }

      groupId = group.id;

      if (!cancelled) setIsOwner(group.owner_id === profile.id);
      if (!cancelled) setOwnerId(group.owner_id);

      const { data: groupMembers } = await getGroupMembers(group.id);

      const list: Member[] = (groupMembers ?? [])
        .filter((m) => m.profile_id !== group.owner_id)
        .map((m) => ({
          id: m.id,
          profile_id: m.profile_id,
          name: m.full_name ?? "Unknown",
          username: m.username ? `@${m.username}` : "",
          role: toRole(m.role),
        }));

      if (group.ownerProfile) {
        list.unshift({
          id: group.ownerProfile.id,
          profile_id: group.ownerProfile.id,
          name: group.ownerProfile.full_name ?? "Owner",
          username: group.ownerProfile.username
            ? `@${group.ownerProfile.username}`
            : "",
          role: "Owner",
        });
      }

      if (!cancelled) {
        setMembers(list);
        setLoading(false);
      }
    };

    load();

    const supabase = createClient();
    const channel = supabase
      .channel("members-card")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "group_members" },
        (payload) => {
          const newGroupId = (payload.new as { group_id?: string }).group_id;
          if (cancelled) return;
          if (!groupId || newGroupId === groupId) load();
        }
      )
      .subscribe();

    const poll = window.setInterval(() => {
      if (!cancelled) load();
    }, 20000);

    return () => {
      cancelled = true;
      window.clearInterval(poll);
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!confirmMember) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmMember(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [confirmMember]);

  const handleKick = async () => {
    if (!confirmMember) return;

    setKicking(true);
    const { error } = await kickMember(confirmMember.id);
    setKicking(false);
    setConfirmMember(null);

    if (!error) {
      setMembers((prev) => prev.filter((m) => m.id !== confirmMember.id));
    }
  };

  return (
    <div className="w-full">
      <h2 className="self-start font-manrope text-xl font-bold text-primary">
        Members
      </h2>
      <div className="mt-4 w-full rounded-2xl border-1 border-border bg-surface p-6">
        {loading ? (
          <p className="text-center font-dm-sans text-sm text-muted">
            Loading members...
          </p>
        ) : members.length === 0 ? (
          <p className="text-center font-dm-sans text-sm text-muted">
            No members yet. Share your invite link to bring people in.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {members.map((member) => {
              const RoleIcon = roleIcons[member.role];
              const canKick =
                isOwner &&
                member.role !== "Owner" &&
                member.profile_id !== ownerId;
              return (
                <li
                  key={member.id}
                  className="flex items-center justify-between rounded-xl border-1 border-border bg-background px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-purple font-dm-sans text-sm font-bold text-white">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-dm-sans text-sm font-semibold text-primary">
                        {member.name}
                      </span>
                      <span className="font-dm-sans text-xs text-muted">
                        {member.username}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex items-center gap-2 rounded-full px-3 py-1 font-dm-sans text-xs font-bold ${roleStyles[member.role]}`}
                    >
                      <RoleIcon className="h-3.5 w-3.5" />
                      {member.role}
                    </span>
                    {canKick && (
                      <button
                        type="button"
                        title={`Kick ${member.name}`}
                        onClick={() => setConfirmMember(member)}
                        className="flex cursor-pointer items-center gap-1 rounded-lg border-1 border-border bg-surface px-2 py-1 font-dm-sans text-xs font-bold text-red-500 transition-colors hover:bg-red-500/10"
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                        Kick
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {confirmMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setConfirmMember(null)}
        >
          <div
            className="w-full max-w-sm rounded-[20px] border-1 border-border bg-surface p-8 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
              <UserMinus className="h-6 w-6 text-red-500" />
            </div>
            <h2 className="mt-4 font-manrope text-xl font-bold text-primary">
              Kick {confirmMember.name}?
            </h2>
            <p className="mt-1 font-dm-sans text-sm text-muted">
              They will lose access to this group and its commitments.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmMember(null)}
                className="flex-1 cursor-pointer rounded-lg border-1 border-border bg-surface py-2 font-dm-sans font-bold text-muted transition-colors hover:bg-border/50 hover:text-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleKick}
                disabled={kicking}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-500 py-2 font-dm-sans font-bold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {kicking && <Users className="h-4 w-4 animate-spin" />}
                {kicking ? "Removing..." : "Kick member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
