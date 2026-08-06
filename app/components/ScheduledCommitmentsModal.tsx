"use client";

import { CalendarClock, Pencil, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import DatePicker from "@/app/components/DatePicker";
import TimePicker from "@/app/components/TimePicker";
import {
  deleteCommitment,
  updateCommitment,
  toHHMM,
} from "@/app/lib/services/commitments";

export interface ScheduledCommitment {
  id: string;
  title: string;
  description?: string;
  scheduledFor: string;
  evaluationTime: string;
}

interface ScheduledCommitmentsModalProps {
  open: boolean;
  items: ScheduledCommitment[];
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}

const formatScheduledDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

export default function ScheduledCommitmentsModal({
  open,
  items,
  onClose,
  onSaved,
  onDeleted,
}: ScheduledCommitmentsModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [evaluationTime, setEvaluationTime] = useState("23:59");
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  const handleClose = useCallback(() => {
    setEditingId(null);
    setConfirmingDeleteId(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editingId) {
          setEditingId(null);
        } else if (confirmingDeleteId) {
          setConfirmingDeleteId(null);
        } else {
          handleClose();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, editingId, confirmingDeleteId, onClose, handleClose]);

  if (!open) return null;

  const startEdit = (item: ScheduledCommitment) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description ?? "");
    setScheduledFor(item.scheduledFor);
    setEvaluationTime(toHHMM(item.evaluationTime));
  };

  const handleSave = async () => {
    if (!editingId || !title.trim()) return;

    setSaving(true);
    const { error } = await updateCommitment(
      editingId,
      title.trim(),
      description.trim(),
      evaluationTime,
      scheduledFor
    );
    setSaving(false);

    if (error) {
      return;
    }

    setEditingId(null);
    onSaved();
  };

  const handleDelete = async () => {
    if (!confirmingDeleteId) return;

    const { error } = await deleteCommitment(confirmingDeleteId);
    if (!error) {
      setConfirmingDeleteId(null);
      onDeleted();
    }
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg rounded-[20px] border-1 border-border bg-surface p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-poppins text-xl font-bold text-primary">
            Scheduled Commitments
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="cursor-pointer rounded-lg p-1 text-muted transition-colors hover:bg-border/50 hover:text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-left font-nunito text-sm text-muted">
          Commitments scheduled for a future date
        </p>

        {items.length === 0 ? (
          <p className="mt-6 text-center font-nunito text-sm text-muted">
            No scheduled commitments yet.
          </p>
        ) : (
          <ul className="feed-scroll mt-4 flex max-h-96 flex-col gap-3 overflow-y-auto pr-1">
            {items.map((item) =>
              editingId === item.id ? (
                <li
                  key={item.id}
                  className="rounded-xl border-1 border-border bg-background p-4"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1 text-left">
                      <label className="font-poppins text-sm font-light text-secondary">
                        Title
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full rounded-xl border-1 border-border bg-surface px-4 py-2 font-nunito text-sm text-primary shadow-sm placeholder:text-muted focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-left">
                      <label className="font-poppins text-sm font-light text-secondary">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full resize-none rounded-xl border-1 border-border bg-surface px-4 py-2 font-nunito text-sm text-primary shadow-sm placeholder:text-muted focus:outline-none"
                      />
                    </div>
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
                        disabled={saving || !title.trim()}
                        className="flex-1 cursor-pointer rounded-lg border-1 border-border bg-surface py-2 font-nunito font-bold text-primary shadow-sm transition-colors hover:bg-border/50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="flex-1 cursor-pointer rounded-lg border-1 border-border bg-transparent py-2 font-nunito font-bold text-muted transition-colors hover:bg-border/50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </li>
              ) : (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border-1 border-border bg-background px-4 py-3"
                >
                  <div className="flex flex-col text-left">
                    <span className="font-nunito text-sm font-semibold text-primary">
                      {item.title}
                    </span>
                    <span className="mt-1 flex items-center gap-1 font-nunito text-xs text-muted">
                      <CalendarClock className="h-3 w-3" />
                      {formatScheduledDate(item.scheduledFor)} at{" "}
                      {toHHMM(item.evaluationTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="flex cursor-pointer items-center gap-1 rounded-lg border-1 border-border bg-surface px-2 py-1 font-nunito text-xs font-bold text-secondary transition-colors hover:bg-secondary/10"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingDeleteId(item.id)}
                      className="flex cursor-pointer items-center gap-1 rounded-lg border-1 border-red-500/30 bg-red-500/10 px-2 py-1 font-nunito text-xs font-bold text-red-500 transition-colors hover:bg-red-500/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </li>
              )
            )}
          </ul>
        )}

        {confirmingDeleteId && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
            onClick={() => setConfirmingDeleteId(null)}
          >
            <div
              className="w-full max-w-sm rounded-[20px] border-1 border-border bg-surface p-8 text-center shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
                <Trash2 className="h-6 w-6 text-red-500" />
              </div>
              <h2 className="mt-4 font-poppins text-xl font-bold text-primary">
                Delete scheduled commitment?
              </h2>
              <p className="mt-1 font-nunito text-sm text-muted">
                This will permanently remove this commitment. This action cannot
                be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmingDeleteId(null)}
                  className="flex-1 cursor-pointer rounded-lg border-1 border-border bg-surface py-2 font-nunito font-bold text-muted transition-colors hover:bg-border/50 hover:text-primary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 cursor-pointer rounded-lg bg-red-500 py-2 font-nunito font-bold text-white transition-colors hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
