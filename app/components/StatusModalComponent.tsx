"use client";

import { GitCommitHorizontal, Pencil, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import TimePicker from "@/app/components/TimePicker";
import StatusDropdown from "@/app/components/StatusDropdown";
import CommitConfirmationModal from "@/app/components/CommitConfirmationModal";
import ConfirmationModalForMissed from "@/app/components/ConfirmationModalForMissed";

export interface StatusCommitment {
  id: string;
  title: string;
  description?: string;
  group: string;
  status: string;
  evaluationTime?: string;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "submitted", label: "Submitted" },
  { value: "missed", label: "Missed" },
];

interface StatusModalComponentProps {
  commitment: StatusCommitment | null;
  onClose: () => void;
  onSubmit: (id: string, status: string) => void;
  onUpdate: (
    id: string,
    title: string,
    description: string,
    evaluationTime: string
  ) => void;
  onDelete: (id: string) => void;
}

export default function StatusModalComponent({
  commitment,
  onClose,
  onSubmit,
  onUpdate,
  onDelete,
}: StatusModalComponentProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(commitment?.title ?? "");
  const [description, setDescription] = useState(commitment?.description ?? "");
  const [evaluationTime, setEvaluationTime] = useState(
    commitment?.evaluationTime ?? "23:59"
  );
  const [status, setStatus] = useState(
    STATUS_OPTIONS.some((o) => o.value === commitment?.status)
      ? (commitment?.status as string)
      : "pending"
  );
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingCommit, setConfirmingCommit] = useState(false);
  const [confirmingMissedCommit, setConfirmingMissedCommit] = useState(false);

  useEffect(() => {
    if (!commitment) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [commitment, onClose]);

  if (!commitment) return null;

  const handleSave = () => {
    onUpdate(commitment.id, title.trim(), description.trim(), evaluationTime);
    setEditing(false);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        onClick={onClose}
      >
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="commitIconGrad" x1="0" y1="0" x2="1" y2="0">
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
            Commitment
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-muted transition-colors hover:bg-border/50 hover:text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 font-nunito text-xs font-bold text-secondary">
            {commitment.group}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-purple/10 px-3 py-1 font-nunito text-xs font-bold text-purple">
            {STATUS_OPTIONS.find((o) => o.value === commitment.status)?.label ??
              commitment.status}
          </span>
        </div>

        {confirmingDelete ? (
          <div className="mt-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2 text-left">
              <h3 className="font-nunito text-lg font-semibold text-primary">
                Delete commitment?
              </h3>
              <p className="font-nunito text-sm text-muted">
                This will permanently remove &quot;{commitment.title}&quot;.
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onDelete(commitment.id)}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-1 border-red-500/30 bg-red-500/10 py-2 font-nunito font-bold text-red-500 transition-colors hover:bg-red-500/20"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-1 border-border bg-transparent py-2 font-nunito font-bold text-muted transition-colors hover:bg-border/50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : editing ? (
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1 text-left">
              <label className="font-poppins text-sm font-light text-secondary">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border-1 border-border bg-transparent px-4 py-2 font-nunito text-sm text-primary shadow-sm placeholder:text-muted focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1 text-left">
              <label className="font-poppins text-sm font-light text-secondary">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none rounded-xl border-1 border-border bg-transparent px-4 py-2 font-nunito text-sm text-primary shadow-sm placeholder:text-muted focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1 text-left">
              <label className="font-poppins text-sm font-light text-secondary">
                Evaluation time
              </label>
              <TimePicker
                value={evaluationTime}
                onChange={setEvaluationTime}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={!title.trim()}
                className="flex-1 cursor-pointer rounded-lg border-1 border-border bg-white py-2 font-nunito font-bold text-primary shadow-sm transition-colors hover:bg-border/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 cursor-pointer rounded-lg border-1 border-border bg-transparent py-2 font-nunito font-bold text-muted transition-colors hover:bg-border/50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-6">
            <div className="flex flex-col gap-1 text-left">
              <h3 className="font-nunito text-lg font-semibold text-primary">
                {commitment.title}
              </h3>
              <p className="font-nunito text-sm text-muted">
                {commitment.description || "No description yet"}
              </p>
            </div>

            <div className="flex flex-col gap-1 text-left">
              <label className="font-poppins text-sm font-light text-secondary">
                Status
              </label>
              <StatusDropdown
                value={status}
                options={STATUS_OPTIONS}
                onChange={setStatus}
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() =>
                  status === "missed"
                    ? setConfirmingMissedCommit(true)
                    : setConfirmingCommit(true)
                }
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-1 border-teal/30 bg-teal/10 py-2 font-nunito font-bold text-teal transition-colors hover:bg-teal/20"
              >
                <GitCommitHorizontal
                  className="h-4 w-4"
                  stroke="url(#commitIconGrad)"
                />
                <span className="bg-gradient-to-r from-purple to-secondary bg-clip-text text-transparent">
                  Commit
                </span>
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-1 border-border bg-transparent py-2 font-nunito font-bold text-secondary transition-colors hover:bg-secondary/10"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-1 border-red-500/30 bg-red-500/10 py-2 font-nunito font-bold text-red-500 transition-colors hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
      <CommitConfirmationModal
        open={confirmingCommit}
        title={commitment.title}
        onClose={() => setConfirmingCommit(false)}
        onConfirm={() => {
          setConfirmingCommit(false);
          onSubmit(commitment.id, "submitted");
        }}
      />
      <ConfirmationModalForMissed
        open={confirmingMissedCommit}
        title={commitment.title}
        onClose={() => setConfirmingMissedCommit(false)}
        onConfirm={() => {
          setConfirmingMissedCommit(false);
          onSubmit(commitment.id, "submitted");
        }}
      />
    </>
  );
}
