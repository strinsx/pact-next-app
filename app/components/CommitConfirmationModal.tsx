"use client";

import { GitCommitHorizontal, X } from "lucide-react";
import { useEffect } from "react";

interface CommitConfirmationModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CommitConfirmationModal({
  open,
  title,
  onClose,
  onConfirm,
}: CommitConfirmationModalProps) {
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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="confirmCommitGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a37af7" />
            <stop offset="100%" stopColor="#4a90f5" />
          </linearGradient>
        </defs>
      </svg>
      <div
        className="w-full max-w-md rounded-[20px] border-1 border-border bg-surface p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-poppins text-xl font-bold text-primary">
            Commit commitment?
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-muted transition-colors hover:bg-border/50 hover:text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-2 text-left">
          <h3 className="font-nunito text-lg font-semibold text-primary">
            {title}
          </h3>
          <p className="font-nunito text-sm text-muted">
            Are you sure you want to commit, all your groups will see this
          </p>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-1 border-teal/30 bg-teal/10 py-2 font-nunito font-bold text-teal transition-colors hover:bg-teal/20"
          >
            <GitCommitHorizontal
              className="h-4 w-4"
              stroke="url(#confirmCommitGrad)"
            />
            <span className="bg-gradient-to-r from-purple to-secondary bg-clip-text text-transparent">
              Yes, Commit
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-1 border-border bg-white py-2 font-nunito font-bold text-muted shadow-sm transition-colors hover:bg-border/50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
