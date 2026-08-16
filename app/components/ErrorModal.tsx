"use client";

import { TriangleAlert, X } from "lucide-react";
import { useEffect } from "react";

interface ErrorModalProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

export default function ErrorModal({ open, message, onClose }: ErrorModalProps) {
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
        className="w-full max-w-md rounded-[20px] border-1 border-red-500/30 bg-surface p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-manrope text-xl font-bold text-red-500">
            Error
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-muted transition-colors hover:bg-border/50 hover:text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 flex items-start gap-3 rounded-xl border-1 border-red-500/30 bg-red-500/10 px-4 py-3">
          <TriangleAlert className="h-5 w-5 shrink-0 text-red-500" />
          <p className="font-dm-sans text-sm text-red-500">{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full cursor-pointer rounded-lg border-1 border-red-500/30 bg-surface py-2 font-dm-sans font-bold text-red-500 shadow-sm transition-colors hover:bg-red-500/10"
        >
          OK
        </button>
      </div>
    </div>
  );
}
