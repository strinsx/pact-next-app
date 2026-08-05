"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  COMMITMENT_TYPES,
  CommitmentType,
  DAYS_OF_WEEK,
} from "@/app/lib/commitments";
import { getCurrentUser } from "@/app/lib/services/auth";
import { getProfileByUserId } from "@/app/lib/services/profile";
import {
  createCommitment,
  hasDuplicateTitle,
} from "@/app/lib/services/commitments";
import { postCommitmentToFeed } from "@/app/lib/services/feed";
import DatePicker from "@/app/components/DatePicker";
import ErrorModal from "@/app/components/ErrorModal";

export interface CreatedCommitment {
  id: string;
  title: string;
  group: string;
  status: string;
}

interface CommitmentModalProps {
  open: boolean;
  type: CommitmentType;
  evaluationTime: string;
  existingTitles?: string[];
  onClose: () => void;
  onCreated?: (commitment: CreatedCommitment) => void;
}

export default function CommitmentModal({ open, type, evaluationTime, existingTitles = [], onClose, onCreated }: CommitmentModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduleDays, setScheduleDays] = useState<number[]>([]);
  const [scheduledFor, setScheduledFor] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorOpen, setErrorOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const toggleDay = (day: number) => {
    setScheduleDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const user = await getCurrentUser();

    if (!user) {
      setError("You must be signed in to create a commitment.");
      setSaving(false);
      return;
    }

    if (type === "routine" && scheduleDays.length === 0) {
      setError("Pick at least one day for your routine.");
      setSaving(false);
      return;
    }

    if (type === "scheduled" && !scheduledFor) {
      setError("Pick a date for this commitment.");
      setSaving(false);
      return;
    }

    const { data: profile, error: profileError } = await getProfileByUserId(
      user.id,
      "id"
    );

    if (profileError || !profile) {
      setError(profileError?.message ?? "Profile not found. Please finish onboarding.");
      setSaving(false);
      return;
    }

    if (
      existingTitles.length > 0 &&
      hasDuplicateTitle(
        existingTitles.map((t) => ({ id: "", title: t })),
        title
      )
    ) {
      setSaving(false);
      setErrorOpen(true);
      return;
    }

    const { data: inserted, error: insertError } = await createCommitment({
      profileId: profile.id,
      title: title.trim(),
      description: description.trim() || null,
      commitmentType: type,
      scheduleDays,
      scheduledFor,
      evaluationTime,
    });

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    await postCommitmentToFeed({
      profileId: profile.id,
      commitmentId: inserted.id,
      title: inserted.title,
      type: "created",
    });

    const typeLabel =
      COMMITMENT_TYPES.find((t) => t.value === type)?.label ?? "Routine";

    onCreated?.({
      id: inserted.id,
      title: inserted.title,
      group: typeLabel,
      status: "Pending",
    });
    setTitle("");
    setDescription("");
    setScheduleDays([]);
    setScheduledFor("");
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
            <h2 className="font-poppins text-xl font-bold text-primary">
              New Commitment
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
            Be specific — your group will see this
          </p>
          <span className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 font-nunito text-xs font-bold text-secondary">
            {COMMITMENT_TYPES.find((t) => t.value === type)?.label ?? "Routine"}
          </span>
          {error && (
            <p className="mt-4 rounded-lg border-1 border-red-500/30 bg-red-500/10 px-3 py-2 font-nunito text-sm text-red-500">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1 text-left">
              <label className="font-poppins text-sm font-light text-secondary">
                Title
              </label>
              <input
                type="text"
                placeholder="e.g. Morning run 5km"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-xl border-1 border-border bg-transparent px-4 py-2 font-nunito text-sm text-primary shadow-sm placeholder:text-muted focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1 text-left">
              <label className="font-poppins text-sm font-light text-secondary">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="What are you committing to?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none rounded-xl border-1 border-border bg-transparent px-4 py-2 font-nunito text-sm text-primary shadow-sm placeholder:text-muted focus:outline-none"
              />
            </div>
            {type === "routine" && (
              <div className="flex flex-col gap-1 text-left">
                <label className="font-poppins text-sm font-light text-secondary">
                  Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const selected = scheduleDays.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`cursor-pointer rounded-full border-1 px-3 py-1 font-nunito text-xs font-bold transition-colors ${
                          selected
                            ? "border-secondary bg-secondary text-white"
                            : "border-border bg-transparent text-muted hover:border-secondary hover:text-secondary"
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
                {scheduleDays.length === 0 && (
                  <p className="font-nunito text-xs text-muted/70">
                    Pick the days this repeats, e.g. Tue, Thu, Sat
                  </p>
                )}
              </div>
            )}
            {type === "scheduled" && (
              <div className="flex flex-col gap-1 text-left">
                <label className="font-poppins text-sm font-light text-secondary">
                  Scheduled for
                </label>
                <DatePicker
                  value={scheduledFor}
                  onChange={setScheduledFor}
                  placeholder="Pick a date"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={saving}
              className="mt-2 w-full cursor-pointer rounded-lg border-1 border-border bg-surface py-2 font-nunito font-bold text-primary shadow-sm transition-colors hover:bg-border/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create Commitment"}
            </button>
          </form>
        </div>
        <ErrorModal
          open={errorOpen}
          message="You cannot commit the same commitment"
          onClose={() => setErrorOpen(false)}
        />
      </div>
    </>
  );
}
