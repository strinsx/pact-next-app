"use client";

import { Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/app/lib/services/auth";
import { getProfileByUserId } from "@/app/lib/services/profile";
import { createGroup, CreatedGroup } from "@/app/lib/services/groups";
import TimePicker from "@/app/components/TimePicker";

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (group: CreatedGroup) => void;
}

export default function CreateGroupModal({
  open,
  onClose,
  onCreated,
}: CreateGroupModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxMembers, setMaxMembers] = useState(5);
  const [evaluationTime, setEvaluationTime] = useState("23:59");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!confirmOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [confirmOpen]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const user = await getCurrentUser();

    if (!user) {
      setError("You must be signed in to create a group.");
      return;
    }

    const { data: profile } = await getProfileByUserId(user.id, "id");

    if (!profile) {
      setError("Profile not found. Please finish onboarding.");
      return;
    }

    if (maxMembers < 2) {
      setError("A group needs at least 2 members.");
      return;
    }

    if (maxMembers > 7) {
      setError("A group can host at most 7 members.");
      return;
    }

    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setSaving(true);
    setConfirmOpen(false);

    const user = await getCurrentUser();

    if (!user) {
      setError("You must be signed in to create a group.");
      setSaving(false);
      return;
    }

    const { data: profile } = await getProfileByUserId(user.id, "id");

    if (!profile) {
      setError("Profile not found. Please finish onboarding.");
      setSaving(false);
      return;
    }

    const { data: created, error: createError } = await createGroup({
      ownerId: profile.id,
      name: name.trim(),
      description: description.trim() || null,
      maxMembers,
      evaluationTime,
    });

    setSaving(false);

    if (createError) {
      setError(createError.message);
      return;
    }

    setName("");
    setDescription("");
    setMaxMembers(5);
    setEvaluationTime("23:59");
    onCreated?.(created);
    onClose();
  };

  return (
    <>
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[20px] border-1 border-border bg-surface p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-manrope text-xl font-bold text-primary">
            Create Group
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-muted transition-colors hover:bg-border/50 hover:text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-left font-dm-sans text-sm text-muted">
          Start your own group and invite people to hold each other accountable
        </p>
        {error && (
          <p className="mt-4 rounded-lg border-1 border-red-500/30 bg-red-500/10 px-3 py-2 font-dm-sans text-sm text-red-500">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1 text-left">
            <label className="font-manrope text-sm font-light text-secondary">
              Group name
            </label>
            <input
              type="text"
              placeholder="e.g. Early Birds"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border-1 border-border bg-transparent px-4 py-2 font-dm-sans text-sm text-primary shadow-sm placeholder:text-muted focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1 text-left">
            <label className="font-manrope text-sm font-light text-secondary">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="What is this group about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-xl border-1 border-border bg-transparent px-4 py-2 font-dm-sans text-sm text-primary shadow-sm placeholder:text-muted focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1 text-left">
            <label className="font-manrope text-sm font-light text-secondary">
              Max members
            </label>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border-1 border-border bg-secondary/10">
                <Users className="h-4 w-4 text-secondary" />
              </div>
              <input
                type="number"
                min={2}
                max={7}
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value))}
                required
                className="w-24 rounded-xl border-1 border-border bg-transparent px-4 py-2 font-dm-sans text-sm text-primary shadow-sm placeholder:text-muted focus:outline-none"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1 text-left">
            <label className="font-manrope text-sm font-light text-secondary">
              Evaluation deadline
            </label>
            <TimePicker value={evaluationTime} onChange={setEvaluationTime} />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-2 w-full cursor-pointer rounded-lg border-1 border-border bg-surface py-2 font-dm-sans font-bold text-primary shadow-sm transition-colors hover:bg-border/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create Group"}
          </button>
        </form>
      </div>
    </div>
    {confirmOpen && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        onClick={() => setConfirmOpen(false)}
      >
        <div
          className="w-full max-w-sm rounded-[20px] border-1 border-border bg-surface p-8 text-center shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
            <Users className="h-6 w-6 text-secondary" />
          </div>
          <h2 className="mt-4 font-manrope text-xl font-bold text-primary">
            Create group?
          </h2>
          <p className="mt-1 font-dm-sans text-sm text-muted">
            You will become the owner of {name.trim()} and can invite up to 7
            members.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="flex-1 cursor-pointer rounded-lg border-1 border-border bg-surface py-2 font-dm-sans font-bold text-muted transition-colors hover:bg-border/50 hover:text-primary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={saving}
              className="flex-1 cursor-pointer rounded-lg border-1 border-border bg-surface py-2 font-dm-sans font-bold text-primary shadow-sm transition-colors hover:bg-border/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Creating..." : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
