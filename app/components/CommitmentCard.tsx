"use client";

import { useState } from "react";
import { Plus, CheckCircle2, Clock, Loader } from "lucide-react";
import CommitmentModal from "@/app/components/CommitmentModal";

const commitments = [
  { id: 1, title: "Morning run 5km", group: "Fitness", status: "Completed" },
  { id: 2, title: "Read 20 pages", group: "Reading", status: "In Progress" },
  { id: 3, title: "Meditate for 10 minutes", group: "Mindfulness", status: "Pending" },
];

const statusStyles = {
  Completed: {
    icon: CheckCircle2,
    className: "bg-teal/10 text-teal",
  },
  "In Progress": {
    icon: Loader,
    className: "bg-secondary/10 text-secondary",
  },
  Pending: {
    icon: Clock,
    className: "bg-purple/10 text-purple",
  },
} as const;

export default function CommitmentCard() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="w-full rounded-2xl border-1 border-border bg-surface p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1 text-left">
          <h2 className="font-poppins text-xl font-bold text-primary">
            Commitments for today
          </h2>
          <p className="font-nunito text-xs text-muted">
            Be specific - your group will see this
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex cursor-pointer items-center gap-2 rounded-lg border-1 border-border bg-white px-4 py-2 font-nunito text-sm font-bold text-primary shadow-sm transition-colors hover:bg-border/50"
        >
          <Plus className="h-4 w-4" />
          Create
        </button>
      </div>
      <ul className="mt-4 flex flex-col gap-3">
        {commitments.map((commitment) => {
          const status = statusStyles[commitment.status];
          const StatusIcon = status.icon;
          return (
            <li
              key={commitment.id}
              className="flex items-center justify-between rounded-xl border-1 border-border bg-background px-4 py-3"
            >
              <div className="flex flex-col">
                <span className="font-nunito text-sm font-semibold text-primary">
                  {commitment.title}
                </span>
                <span className="font-nunito text-xs text-muted">
                  {commitment.group}
                </span>
              </div>
              <span
                className={`flex items-center gap-2 rounded-full px-3 py-1 font-nunito text-xs font-bold ${status.className}`}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {commitment.status}
              </span>
            </li>
          );
        })}
      </ul>
      <CommitmentModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
