"use client";

import { KeyRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/app/lib/services/auth";
import { getProfileByUserId } from "@/app/lib/services/profile";
import { joinGroupByInviteCode, JoinedGroup } from "@/app/lib/services/groups";

interface JoinGroupModalProps {
  open: boolean;
  onClose: () => void;
  onJoin?: (group: JoinedGroup) => void;
}

export default function JoinGroupModal({
  open,
  onClose,
  onJoin,
}: JoinGroupModalProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const code = inviteCode.trim().toUpperCase();
    if (!code) return;

    setSubmitting(true);

    const user = await getCurrentUser();

    if (!user) {
      setError("You must be signed in to join a group.");
      setSubmitting(false);
      return;
    }

    const { data: profile } = await getProfileByUserId(user.id, "id");

    if (!profile) {
      setError("Profile not found. Please finish onboarding.");
      setSubmitting(false);
      return;
    }

    const { error: joinError } = await joinGroupByInviteCode(
      code,
      profile.id
    );

    setSubmitting(false);

    if (joinError) {
      setError(joinError.message);
      return;
    }

    setInviteCode("");
    setSuccess("Request sent! The owner will review your request.");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[20px] border-1 border-border bg-surface p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-poppins text-xl font-bold text-primary">
            Join Group
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-muted transition-colors hover:bg-border/50 hover:text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-left font-nunito text-sm text-muted">
          Enter the invite code shared by a group owner
        </p>
        {error && (
          <p className="mt-4 rounded-lg border-1 border-red-500/30 bg-red-500/10 px-3 py-2 font-nunito text-sm text-red-500">
            {error}
          </p>
        )}
        {success && (
          <p className="mt-4 rounded-lg border-1 border-teal/30 bg-teal/10 px-3 py-2 font-nunito text-sm text-teal">
            {success}
          </p>
        )}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1 text-left">
            <label className="font-poppins text-sm font-light text-secondary">
              Invite code
            </label>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border-1 border-border bg-secondary/10">
                <KeyRound className="h-4 w-4 text-secondary" />
              </div>
              <input
                type="text"
                placeholder="e.g. 4F7K2Q9X"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                required
                className="w-full rounded-xl border-1 border-border bg-transparent px-4 py-2 font-nunito text-sm text-primary uppercase shadow-sm placeholder:normal-case placeholder:text-muted focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 w-full cursor-pointer rounded-lg border-1 border-border bg-surface py-2 font-nunito font-bold text-primary shadow-sm transition-colors hover:bg-border/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Joining..." : "Join Group"}
          </button>
        </form>
      </div>
    </div>
  );
}