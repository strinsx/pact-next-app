"use client";

import { CalendarClock, Repeat, Target, X } from "lucide-react";
import { useEffect } from "react";
import { COMMITMENT_TYPES, CommitmentType } from "@/app/lib/commitments";

const typeIcons = {
  standard: Target,
  routine: Repeat,
  scheduled: CalendarClock,
} as const;

interface CommitmentOptionsModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: CommitmentType) => void;
}

export default function CommitmentOptionsModal({
  open,
  onClose,
  onSelect,
}: CommitmentOptionsModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[20px] border-1 border-border bg-surface p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-poppins text-xl font-bold text-primary">
            Choose Commitment Type
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
          How do you want to commit?
        </p>
        <div className="mt-6 flex flex-col gap-3">
          {COMMITMENT_TYPES.map((option) => {
            const Icon = typeIcons[option.value];
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelect(option.value)}
                className="flex w-full cursor-pointer items-center gap-4 rounded-xl border-1 border-border bg-surface px-4 py-3 text-left shadow-sm transition-colors hover:border-secondary hover:bg-secondary/5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
                  <Icon className="h-5 w-5 text-secondary" />
                </span>
                <span className="flex flex-1 flex-col">
                  <span className="font-nunito text-sm font-bold text-primary">
                    {option.label}
                  </span>
                  <span className="font-nunito text-xs text-muted">
                    {option.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
