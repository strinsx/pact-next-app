"use client";

import { Clock3, Users, ShieldCheck, LinkIcon, UserRoundCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/app/lib/services/auth";
import { getProfileByUserId } from "@/app/lib/services/profile";
import { getMyGroupOverview, GroupOverview } from "@/app/lib/services/groups";

export default function GroupsOverviewCard() {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [group, setGroup] = useState<GroupOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const user = await getCurrentUser();
      if (!user) return;

      const { data: profile } = await getProfileByUserId(user.id, "id");
      if (!profile) return;

      const overview = await getMyGroupOverview(profile.id);

      if (!cancelled) {
        setGroup(overview);
        setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleGenerate = async () => {
    if (!group) return;
    setGenerating(true);
    setCopied(false);
    await navigator.clipboard.writeText(
      `${window.location.origin}/groups/join?code=${group.invite_code}`
    );
    setGenerating(false);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="w-full rounded-2xl border-1 border-border bg-surface p-6 text-left font-nunito text-sm text-muted">
        Loading group...
      </div>
    );
  }

  if (!group) {
    return (
      <div className="w-full rounded-2xl border-1 border-border bg-surface p-6 text-left">
        <h2 className="font-poppins text-xl font-bold text-primary">
          Your Group
        </h2>
        <p className="mt-2 font-nunito text-sm text-muted">
          You haven&apos;t created a group yet. Use the + Commitment button in the
          sidebar to start one.
        </p>
      </div>
    );
  }

  const roles = group.roles.map((r) => ({
    ...r,
    label: r.role.charAt(0).toUpperCase() + r.role.slice(1),
  }));

  return (
    <div className="w-full rounded-2xl border-1 border-border bg-surface p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1 text-left">
          <h2 className="bg-gradient-to-r from-sky-400 to-purple bg-clip-text font-poppins text-2xl font-bold text-transparent">
            {group.name}
          </h2>
          <p className="font-nunito text-sm text-muted">
            {group.description}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="flex cursor-pointer items-center gap-2 rounded-lg border-1 border-border bg-white px-4 py-2 font-nunito text-sm font-bold text-primary shadow-sm transition-colors hover:bg-border/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LinkIcon className="h-4 w-4" />
            {generating
              ? "Generating code..."
              : copied
                ? "Copied"
                : "Generate join link"}
          </button>
          <a
            href="#join-access"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("join-access")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex cursor-pointer items-center gap-2 rounded-lg border-1 border-border bg-surface px-4 py-2 font-nunito text-sm font-bold text-muted transition-colors hover:bg-border/50 hover:text-primary"
          >
            <UserRoundCheck className="h-4 w-4" />
            Review requests
          </a>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border-1 border-border bg-background p-4 text-left">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-purple" />
            <span className="font-nunito text-sm font-bold text-primary">
              Pending
            </span>
          </div>
          <p className="mt-2 bg-gradient-to-r from-purple to-secondary bg-clip-text font-poppins text-3xl font-bold text-transparent">
            0
          </p>
          <p className="font-nunito text-xs text-muted">join requests</p>
        </div>
        <div className="rounded-xl border-1 border-border bg-background p-4 text-left">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-teal" />
            <span className="font-nunito text-sm font-bold text-primary">
              Members
            </span>
          </div>
          <p className="mt-2 bg-gradient-to-r from-sky-400 to-teal bg-clip-text font-poppins text-3xl font-bold text-transparent">
            {group.memberCount}
          </p>
          <p className="font-nunito text-xs text-muted">group members</p>
        </div>
        <div className="rounded-xl border-1 border-border bg-background p-4 text-left">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-secondary" />
            <span className="font-nunito text-sm font-bold text-primary">
              Roles
            </span>
          </div>
          <div className="mt-2 flex flex-col gap-1">
            {roles.length > 0 ? (
              roles.map((r) => (
                <div
                  key={r.role}
                  className="flex items-center justify-between font-nunito text-sm"
                >
                  <span className="text-muted">{r.label}</span>
                  <span className="font-bold text-primary">{r.count}</span>
                </div>
              ))
            ) : (
              <span className="font-nunito text-sm text-muted">
                No members yet
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}