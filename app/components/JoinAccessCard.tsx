"use client";

import { Copy, Link2, LinkIcon, Clock3, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { getCurrentUser } from "@/app/lib/services/auth";
import { getProfileByUserId } from "@/app/lib/services/profile";
import {
  getMyGroupOverview,
  getPendingJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  PendingJoinRequest,
} from "@/app/lib/services/groups";

export default function JoinAccessCard() {
  const [joinLink, setJoinLink] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<PendingJoinRequest[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] =
    useState<PendingJoinRequest | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let groupId: string | null = null;

    const load = async () => {
      const user = await getCurrentUser();
      if (!user) return;

      const { data: profile } = await getProfileByUserId(user.id, "id");
      if (!profile) return;

      const group = await getMyGroupOverview(profile.id);

      if (!group) {
        if (!cancelled) setLoading(false);
        return;
      }

      groupId = group.id;

      if (!cancelled) setIsOwner(group.isOwner);

      if (group.isOwner) {
        const { data: pending } = await getPendingJoinRequests(group.id);

        if (!cancelled) {
          setInviteCode(group.invite_code);
          setPendingRequests(pending ?? []);
          setLoading(false);
        }
      } else if (!cancelled) {
        setLoading(false);
      }
    };

    load();

    const supabase = createClient();
    const channel = supabase
      .channel("join-access")
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

  const handleGenerate = () => {
    if (!inviteCode) return;
    setJoinLink(`${window.location.origin}/groups/join?code=${inviteCode}`);
    setCopied(false);
    setCodeCopied(false);
  };

  const handleCopyLink = async () => {
    if (!joinLink) return;
    await navigator.clipboard.writeText(joinLink);
    setCopied(true);
  };

  const handleCopyCode = async () => {
    if (!inviteCode) return;
    await navigator.clipboard.writeText(inviteCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  useEffect(() => {
    if (!selectedRequest) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedRequest(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedRequest]);

  const handleReview = async (approved: boolean) => {
    if (!selectedRequest) return;

    setProcessing(true);
    const { error } = approved
      ? await approveJoinRequest(selectedRequest.id)
      : await rejectJoinRequest(selectedRequest.id);
    setProcessing(false);

    if (error) {
      console.error("[groups] failed to review request:", error.message);
      return;
    }

    setPendingRequests((prev) =>
      prev.filter((req) => req.id !== selectedRequest.id)
    );
    setSelectedRequest(null);
  };

  return (
    <div className="w-full">
      <h2 className="self-start font-poppins text-xl font-bold text-primary">
        Join Access
      </h2>
      {!isOwner && !loading ? (
        <div className="mt-4 rounded-2xl border-1 border-border bg-surface p-6">
          <p className="text-left font-nunito text-sm text-muted">
            Invites are managed by the group owner. Only the owner can view
            pending requests and share the invite link.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="min-h-50 rounded-2xl border-1 border-border bg-surface p-6">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-purple" />
            <span className="font-nunito text-sm font-bold text-primary">
              Pending Requests
            </span>
          </div>
          {loading ? (
            <div className="flex min-h-32 items-center justify-center">
              <p className="text-center font-nunito text-sm text-muted">
                Loading requests...
              </p>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="flex min-h-32 items-center justify-center">
              <p className="text-center font-nunito text-sm text-muted">
                no pending requests right now
              </p>
            </div>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {pendingRequests.map((req) => {
                const fullName = req.profiles?.full_name?.trim();
                const initial = fullName?.charAt(0).toUpperCase() ?? "?";
                return (
                  <li key={req.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedRequest(req)}
                      className="flex w-full cursor-pointer items-center justify-between rounded-xl border-1 border-border bg-background px-3 py-2 text-left transition-colors hover:border-secondary"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple/10 font-nunito text-xs font-bold text-purple">
                          {initial}
                        </div>
                        <span className="font-nunito text-sm font-bold text-primary">
                          {fullName ?? "Unknown"}
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <span className="rounded-full bg-purple/10 px-2.5 py-0.5 font-nunito text-xs font-bold text-purple">
                          Pending
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted" />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="rounded-2xl border-1 border-border bg-surface p-6">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-secondary" />
            <span className="font-nunito text-sm font-bold text-primary">
              Invite Link
            </span>
          </div>
          <div className="mt-3 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || !inviteCode}
              className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border-1 border-border bg-surface px-4 py-2 font-nunito text-sm font-bold text-primary shadow-sm transition-colors hover:bg-border/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LinkIcon className="h-4 w-4" />
              Generate join link
            </button>
            {joinLink && (
              <div className="flex items-center gap-2 rounded-xl border-1 border-border bg-background px-3 py-2">
                <span className="flex-1 truncate font-nunito text-xs text-muted">
                  {joinLink}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 py-1 font-nunito text-xs font-bold text-secondary transition-colors hover:bg-secondary/10"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            )}
            {joinLink && inviteCode && (
              <div className="rounded-xl border-1 border-dashed border-secondary/40 bg-background p-4 text-center">
                <p className="font-nunito text-xs font-semibold uppercase tracking-wide text-muted">
                  Invite code
                </p>
                <p className="mt-1 font-poppins text-2xl font-bold tracking-[0.25em] text-primary">
                  {inviteCode}
                </p>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="mt-2 flex w-fit cursor-pointer items-center gap-1 rounded-lg border-1 border-border bg-surface px-3 py-1.5 font-nunito text-xs font-bold text-primary shadow-sm transition-colors hover:bg-border/50"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {codeCopied ? "Copied" : "Copy code"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      )}
      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="w-full max-w-sm rounded-[20px] border-1 border-border bg-surface p-8 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-purple/10">
              <span className="font-poppins text-xl font-bold text-purple">
                {selectedRequest.profiles?.full_name?.charAt(0).toUpperCase() ??
                  "?"}
              </span>
            </div>
            <h2 className="mt-4 font-poppins text-xl font-bold text-primary">
              Review join request
            </h2>
            <p className="mt-1 font-nunito text-sm text-muted">
              {selectedRequest.profiles?.full_name?.trim() ?? "Unknown"} wants
              to join your group.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => handleReview(false)}
                disabled={processing}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-1 border-border bg-surface py-2 font-nunito font-bold text-red-500 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => handleReview(true)}
                disabled={processing}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal to-emerald-500 py-2 font-nunito font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processing ? "Processing..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}