"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Mail,
  Pencil,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import { getCurrentUser } from "@/app/lib/services/auth";
import { getProfileByUserId, updateProfile } from "@/app/lib/services/profile";
import {
  CommitmentRow,
  listCommitmentsByProfile,
} from "@/app/lib/services/commitments";
import { getMyGroups } from "@/app/lib/services/groups";
import { COMMITMENT_TYPES } from "@/app/lib/commitments";
import { emitDataChanged, subscribeDataChanged } from "@/app/lib/events";
import StatCards from "@/app/components/StatCards";

const statusStyles = {
  pending: {
    icon: Clock,
    className: "bg-purple/10 text-purple",
    label: "Pending",
  },
  submitted: {
    icon: CheckCircle2,
    className: "bg-teal/10 text-teal",
    label: "Submitted",
  },
  missed: {
    icon: TriangleAlert,
    className: "bg-red-500/10 text-red-500",
    label: "Missed",
  },
} as const;

interface ProfileData {
  fullName: string | null;
  username: string | null;
  email: string | null;
  joinedAt: string | null;
  avatarUrl: string | null;
}

interface RecentCommitment {
  id: string;
  title: string;
  typeLabel: string;
  status: string;
}

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return (first + last).toUpperCase() || "P";
};

const formatJoined = (iso: string) =>
  new Date(iso).toLocaleDateString("en", {
    month: "long",
    year: "numeric",
  });

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [commitments, setCommitments] = useState<RecentCommitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftUsername, setDraftUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const loadAll = async () => {
      const user = await getCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profileRow } = await getProfileByUserId(
        user.id,
        "id, full_name, username"
      );

      setProfile({
        fullName: profileRow?.full_name ?? null,
        username: profileRow?.username ?? null,
        email: user.email ?? null,
        joinedAt: user.created_at ?? null,
        avatarUrl:
          (user.user_metadata?.avatar_url as string | undefined) ?? null,
      });

      if (profileRow) {
        setGroups(await getMyGroups(profileRow.id));

        const { data: rows } = await listCommitmentsByProfile(profileRow.id);
        setCommitments(
          ((rows ?? []) as CommitmentRow[]).slice(0, 5).map((row) => ({
            id: row.id,
            title: row.title,
            typeLabel:
              COMMITMENT_TYPES.find((t) => t.value === row.commitment_type)
                ?.label ?? row.commitment_type,
            status: row.status,
          }))
        );
      }

      setLoading(false);
    };

    loadAll();
    return subscribeDataChanged(loadAll);
  }, []);

  const openEdit = () => {
    setDraftName(profile?.fullName ?? "");
    setDraftUsername(profile?.username ?? "");
    setSaveError(null);
    setEditOpen(true);
  };

  useEffect(() => {
    if (!editOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [editOpen]);

  const handleSave = async () => {
    const name = draftName.trim();
    const username = draftUsername.trim();

    if (!name || !username) {
      setSaveError("Name and username are required.");
      return;
    }

    const user = await getCurrentUser();
    if (!user) return;

    setSaving(true);
    setSaveError(null);
    const { error } = await updateProfile(user.id, {
      full_name: name,
      username,
    });
    setSaving(false);

    if (error) {
      setSaveError(error.message);
      return;
    }

    setProfile((prev) => (prev ? { ...prev, fullName: name, username } : prev));
    setEditOpen(false);
    emitDataChanged();
  };

  const avatar = profile?.avatarUrl ? (
    <div
      className="h-20 w-20 shrink-0 rounded-full bg-cover bg-center ring-2 ring-secondary/30"
      style={{ backgroundImage: `url(${profile.avatarUrl})` }}
    />
  ) : (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-purple font-poppins text-3xl font-bold text-white">
      {initials(profile?.fullName ?? "P")}
    </div>
  );

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="w-full rounded-2xl border-1 border-border bg-surface p-6">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-center">
          {avatar}
          <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
            <h1 className="bg-gradient-to-r from-sky-400 to-purple bg-clip-text font-poppins text-2xl font-bold text-transparent">
              {profile?.fullName ?? "Your Pact"}
            </h1>
            <span className="font-nunito text-sm font-semibold text-muted">
              {profile?.username ? `@${profile.username}` : "Set a username"}
            </span>
            {profile?.email && (
              <span className="mt-2 flex items-center gap-2 font-nunito text-sm text-muted">
                <Mail className="h-4 w-4 shrink-0 text-secondary" />
                {profile.email}
              </span>
            )}
            {profile?.joinedAt && (
              <span className="mt-1 flex items-center gap-2 font-nunito text-xs text-muted/70">
                <CalendarDays className="h-4 w-4 shrink-0 text-secondary" />
                Member since {formatJoined(profile.joinedAt)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={openEdit}
            className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border-1 border-border bg-surface px-4 py-2 font-nunito text-sm font-bold text-primary shadow-sm transition-colors hover:bg-border/50"
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </button>
        </div>
      </div>

      <div className="mt-2 w-full">
        <StatCards />
      </div>

      <div className="mt-2 grid w-full gap-2 lg:grid-cols-2">
        <div className="w-full rounded-2xl border-1 border-border bg-surface p-6">
          <h2 className="font-poppins text-xl font-bold text-primary">
            My Groups
          </h2>
          {loading ? (
            <p className="mt-4 text-center font-nunito text-sm text-muted">
              Loading groups...
            </p>
          ) : groups.length === 0 ? (
            <p className="mt-4 text-center font-nunito text-sm text-muted">
              You are not part of any group yet. Create or join one from the
              sidebar.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {groups.map((group) => (
                <li
                  key={group.id}
                  className="flex items-center gap-3 rounded-xl border-1 border-border bg-background px-4 py-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/10">
                    <Users className="h-4 w-4 text-secondary" />
                  </div>
                  <span className="font-nunito text-sm font-semibold text-primary">
                    {group.name}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="w-full rounded-2xl border-1 border-border bg-surface p-6">
          <h2 className="font-poppins text-xl font-bold text-primary">
            Recent Commitments
          </h2>
          {loading ? (
            <p className="mt-4 text-center font-nunito text-sm text-muted">
              Loading commitments...
            </p>
          ) : commitments.length === 0 ? (
            <p className="mt-4 text-center font-nunito text-sm text-muted">
              No commitments yet. Create your first one.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {commitments.map((commitment) => {
                const status =
                  statusStyles[commitment.status as keyof typeof statusStyles] ??
                  statusStyles.pending;
                const StatusIcon = status.icon;
                return (
                  <li
                    key={commitment.id}
                    className="flex items-center justify-between rounded-xl border-1 border-border bg-background px-4 py-3"
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-nunito text-sm font-semibold text-primary">
                        {commitment.title}
                      </span>
                      <span className="font-nunito text-xs text-muted">
                        {commitment.typeLabel}
                      </span>
                    </div>
                    <span
                      className={`flex items-center gap-2 rounded-full px-3 py-1 font-nunito text-xs font-bold ${status.className}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {status.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setEditOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-[20px] border-1 border-border bg-surface p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-poppins text-xl font-bold text-primary">
                Edit Profile
              </h2>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="cursor-pointer rounded-lg p-1 text-muted transition-colors hover:bg-border/50 hover:text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {saveError && (
              <p className="mt-4 rounded-lg border-1 border-red-500/30 bg-red-500/10 px-3 py-2 font-nunito text-sm text-red-500">
                {saveError}
              </p>
            )}
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1 text-left">
                <label className="font-poppins text-sm font-light text-secondary">
                  Full name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className="w-full rounded-xl border-1 border-border bg-transparent px-4 py-2 font-nunito text-sm text-primary shadow-sm placeholder:text-muted focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1 text-left">
                <label className="font-poppins text-sm font-light text-secondary">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. alex"
                  value={draftUsername}
                  onChange={(e) => setDraftUsername(e.target.value)}
                  className="w-full rounded-xl border-1 border-border bg-transparent px-4 py-2 font-nunito text-sm text-primary shadow-sm placeholder:text-muted focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="mt-2 w-full cursor-pointer rounded-lg border-1 border-border bg-surface py-2 font-nunito font-bold text-primary shadow-sm transition-colors hover:bg-border/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
