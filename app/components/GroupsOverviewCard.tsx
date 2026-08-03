"use client";

import { Clock3, Users, ShieldCheck, LinkIcon, UserRoundCheck } from "lucide-react";
import { useState } from "react";

const mockGroup = {
  name: "Fitness Pact",
  description:
    "A small accountability circle for daily movement and healthy habits. Commit, show up, and hold each other accountable.",
  pendingRequests: 3,
  memberCount: 5,
  inviteCode: "4F7K2Q9X",
  roles: [
    { role: "Owner", count: 1 },
    { role: "Admin", count: 2 },
    { role: "Member", count: 2 },
  ],
};

export default function GroupsOverviewCard() {
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    await navigator.clipboard.writeText(
      `${window.location.origin}/groups/join?code=${mockGroup.inviteCode}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-2xl border-1 border-border bg-surface p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1 text-left">
          <h2 className="bg-gradient-to-r from-sky-400 to-purple bg-clip-text font-poppins text-2xl font-bold text-transparent">
            {mockGroup.name}
          </h2>
          <p className="font-nunito text-sm text-muted">
            {mockGroup.description}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            className="flex cursor-pointer items-center gap-2 rounded-lg border-1 border-border bg-white px-4 py-2 font-nunito text-sm font-bold text-primary shadow-sm transition-colors hover:bg-border/50"
          >
            <LinkIcon className="h-4 w-4" />
            {copied ? "Copied" : "Generate join link"}
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
            {mockGroup.pendingRequests}
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
            {mockGroup.memberCount}
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
            {mockGroup.roles.map((r) => (
              <div
                key={r.role}
                className="flex items-center justify-between font-nunito text-sm"
              >
                <span className="text-muted">{r.role}</span>
                <span className="font-bold text-primary">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
