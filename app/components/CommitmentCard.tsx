"use client";

import { useEffect, useState } from "react";
import { Archive, Plus, CheckCircle2, Clock, TriangleAlert } from "lucide-react";
import { CommitmentType } from "@/app/lib/commitments";
import CommitmentModal from "@/app/components/CommitmentModal";
import CommitmentOptionsModal from "@/app/components/CommitmentOptionsModal";
import TimePicker from "@/app/components/TimePicker";
import StatusModalComponent, {
  StatusCommitment,
} from "@/app/components/StatusModalComponent";
import ArchiveModal, {
  ArchivedCommitment,
} from "@/app/components/ArchiveModal";
import { getCurrentUser } from "@/app/lib/services/auth";
import { getProfileByUserId, updateEvaluationTime } from "@/app/lib/services/profile";
import {
  CommitmentRow,
  listCommitmentsByProfile,
  submitCommitment,
  updateCommitment,
  deleteCommitment,
  toHHMM,
  isPastEvaluation,
} from "@/app/lib/services/commitments";
import { COMMITMENT_TYPES } from "@/app/lib/commitments";

const statusStyles = {
  pending: {
    icon: Clock,
    className: "bg-purple/10 text-purple",
    label: "Pending",
  },
  submitted: {
    icon: CheckCircle2,
    className: "bg-teal/10 text-teal",
    label: "Submitted",
  },
  missed: {
    icon: TriangleAlert,
    className: "bg-red-500/10 text-red-500",
    label: "Missed",
  },
} as const;

export default function CommitmentCard() {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<CommitmentType>("standard");
  const [items, setItems] = useState<StatusCommitment[]>([]);
  const [archivedItems, setArchivedItems] = useState<ArchivedCommitment[]>([]);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [selected, setSelected] = useState<StatusCommitment | null>(null);
  const [evaluationTime, setEvaluationTime] = useState("23:59");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const loadCommitments = async () => {
      setLoading(true);

      const user = await getCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await getProfileByUserId(
        user.id,
        "id, evaluation_time"
      );

      if (!profile) {
        setLoading(false);
        return;
      }

      const profileEvalTime = toHHMM(profile.evaluation_time);
      if (profile.evaluation_time) {
        setEvaluationTime(profileEvalTime);
      }

      const { data: rows } = await listCommitmentsByProfile(profile.id);

      const active: StatusCommitment[] = [];
      const archived: ArchivedCommitment[] = [];

      for (const row of (rows ?? []) as CommitmentRow[]) {
        const base = {
          id: row.id,
          title: row.title,
          description: row.description ?? undefined,
          group:
            COMMITMENT_TYPES.find((t) => t.value === row.commitment_type)
              ?.label ?? row.commitment_type,
          status: row.status,
          evaluationTime: toHHMM(row.evaluation_time),
        };

        if (isPastEvaluation(row.commitment_date, profileEvalTime)) {
          archived.push({
            id: row.id,
            title: row.title,
            group: base.group,
            status: row.status === "submitted" ? "Completed" : "Missed",
            submittedAt: row.submitted_at,
          });
        } else {
          active.push(base);
        }
      }

      setItems(active);
      setArchivedItems(archived);
      setLoading(false);
    };

    loadCommitments();
  }, [reloadKey]);

  const handleSubmit = async (id: string, status: string) => {
    await submitCommitment(id, status);

    setSelected(null);
    setReloadKey((k) => k + 1);
  };

  const handleUpdate = async (
    id: string,
    title: string,
    description: string,
    evaluationTime: string
  ) => {
    await updateCommitment(id, title, description, evaluationTime);

    setSelected((prev) =>
      prev && prev.id === id
        ? { ...prev, title, description, evaluationTime }
        : prev
    );
    setReloadKey((k) => k + 1);
  };

  const handleDelete = async (id: string) => {
    await deleteCommitment(id);

    setSelected(null);
    setReloadKey((k) => k + 1);
  };

  const handleEvaluationTimeUpdate = async (time: string) => {
    setEvaluationTime(time);

    const user = await getCurrentUser();
    if (!user) return;

    await updateEvaluationTime(user.id, time);
  };

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
          <p className="font-nunito text-xs text-muted/70">
            Commitments are evaluated automatically once the daily deadline
            passes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TimePicker
            value={evaluationTime}
            onChange={handleEvaluationTimeUpdate}
          />
          <button
            type="button"
            onClick={() => setArchiveOpen(true)}
            className="flex cursor-pointer items-center gap-2 rounded-lg border-1 border-border bg-background px-3 py-2 font-nunito text-sm font-bold text-muted shadow-sm transition-colors hover:border-secondary hover:text-secondary"
          >
            <Archive className="h-4 w-4" />
            Archive
          </button>
          <button
            type="button"
            onClick={() => setOptionsOpen(true)}
            className="flex cursor-pointer items-center gap-2 rounded-lg border-1 border-border bg-white px-4 py-2 font-nunito text-sm font-bold text-primary shadow-sm transition-colors hover:bg-border/50"
          >
            <Plus className="h-4 w-4" />
            Create
          </button>
        </div>
      </div>
      {loading ? (
        <p className="mt-6 text-center font-nunito text-sm text-muted">
          Loading commitments...
        </p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-center font-nunito text-sm text-muted">
          No commitments yet. Create your first one.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {items.map((commitment) => {
            const status =
              statusStyles[commitment.status as keyof typeof statusStyles] ??
              statusStyles.pending;
            const StatusIcon = status.icon;
            return (
              <li
                key={commitment.id}
                onClick={() =>
                  commitment.status !== "submitted" &&
                  setSelected(commitment)
                }
                className={`flex items-center justify-between rounded-xl border-1 border-border bg-background px-4 py-3 transition-colors ${
                  commitment.status === "submitted"
                    ? "cursor-default"
                    : "cursor-pointer hover:border-secondary"
                }`}
              >
                <div className="flex flex-col text-left">
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
                  {status.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      <CommitmentOptionsModal
        open={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        onSelect={(type) => {
          setSelectedType(type);
          setOptionsOpen(false);
          setCreateOpen(true);
        }}
      />
      <CommitmentModal
        open={createOpen}
        type={selectedType}
        evaluationTime={evaluationTime}
        existingTitles={items.map((c) => c.title)}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          setReloadKey((k) => k + 1);
        }}
      />
      <StatusModalComponent
        key={selected?.id ?? "none"}
        commitment={selected}
        onClose={() => setSelected(null)}
        onSubmit={handleSubmit}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
      <ArchiveModal
        open={archiveOpen}
        items={archivedItems}
        onClose={() => setArchiveOpen(false)}
      />
    </div>
  );
}
