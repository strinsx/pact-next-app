"use client";

import { Archive, CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";

export interface ArchivedCommitment {
  id: string;
  title: string;
  group: string;
  status: "Completed" | "Missed";
  submittedAt: string | null;
}

interface ArchiveModalProps {
  open: boolean;
  items: ArchivedCommitment[];
  onClose: () => void;
}

const formatSubmittedAt = (value: string | null) => {
  if (!value) return null;
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function ArchiveModal({ open, items, onClose }: ArchiveModalProps) {
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
        className="w-full max-w-lg rounded-[20px] border-1 border-border bg-surface p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-poppins text-xl font-bold text-primary">
            Archive
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
          Commitments past your daily evaluation deadline
        </p>

        {items.length === 0 ? (
          <p className="mt-6 text-center font-nunito text-sm text-muted">
            No archived commitments yet.
          </p>
        ) : (
          <ul className="feed-scroll mt-4 flex max-h-96 flex-col gap-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-xl border-1 border-border bg-background px-4 py-3"
              >
                <div className="flex flex-col text-left">
                  <span className="font-nunito text-sm font-semibold text-primary">
                    {item.title}
                  </span>
                  <span className="font-nunito text-xs text-muted">
                    {item.group}
                  </span>
                  <span className="mt-1 flex items-center gap-1 font-nunito text-xs text-muted">
                    <Archive className="h-3 w-3" />
                    {item.status === "Completed"
                      ? formatSubmittedAt(item.submittedAt) ?? "Submitted"
                      : "Missed"}
                  </span>
                </div>
                <span
                  className={`flex items-center gap-2 rounded-full px-3 py-1 font-nunito text-xs font-bold ${
                    item.status === "Completed"
                      ? "bg-teal/10 text-teal"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
