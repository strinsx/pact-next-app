"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface CommitmentModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CommitmentModal({ open, onClose }: CommitmentModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onClose();
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
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1 text-left">
            <label className="font-poppins text-sm font-light text-secondary">
              Title
            </label>
            <input
              type="text"
              placeholder="e.g. Morning run 5km"
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
              className="w-full resize-none rounded-xl border-1 border-border bg-transparent px-4 py-2 font-nunito text-sm text-primary shadow-sm placeholder:text-muted focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="mt-2 w-full cursor-pointer rounded-lg border-1 border-border bg-white py-2 font-nunito font-bold text-primary shadow-sm transition-colors hover:bg-border/50"
          >
            Create Commitment
          </button>
        </form>
      </div>
    </div>
  );
}
