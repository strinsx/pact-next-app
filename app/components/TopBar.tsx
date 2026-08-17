"use client";

import { Bell, Moon, Plus, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/app/lib/services/auth";
import { getProfileByUserId } from "@/app/lib/services/profile";
import { toHHMM } from "@/app/lib/services/commitments";
import { CommitmentType } from "@/app/lib/commitments";
import { toggleTheme, useTheme } from "@/app/lib/theme";
import CommitmentOptionsModal from "@/app/components/CommitmentOptionsModal";
import CommitmentModal from "@/app/components/CommitmentModal";

export default function TopBar() {
  const theme = useTheme();
  const [fullName, setFullName] = useState<string | null>(null);
  const [evaluationTime, setEvaluationTime] = useState("23:59");
  const [commitmentOptionsOpen, setCommitmentOptionsOpen] = useState(false);
  const [commitmentOpen, setCommitmentOpen] = useState(false);
  const [commitmentType, setCommitmentType] =
    useState<CommitmentType>("standard");

  useEffect(() => {
    const loadProfile = async () => {
      const user = await getCurrentUser();
      if (!user) return;

      const { data: profile } = await getProfileByUserId(
        user.id,
        "full_name, evaluation_time"
      );

      if (profile?.full_name) {
        setFullName(profile.full_name);
      }
      if (profile?.evaluation_time) {
        setEvaluationTime(toHHMM(profile.evaluation_time));
      }
    };

    loadProfile();
  }, []);

  const firstInitial = (fullName?.trim().charAt(0) ?? "P").toUpperCase();

  return (
    <>
    <header className="sticky top-0 z-20 flex h-16 items-center justify-end gap-3 border-b border-border bg-surface/90 px-6 backdrop-blur">
      <button
        type="button"
        onClick={() => setCommitmentOptionsOpen(true)}
        title="Commitment"
        className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border-1 border-border bg-surface px-4 font-dm-sans text-sm text-primary shadow-sm transition-colors hover:bg-border/50"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Commitment</span>
      </button>
      <button
        type="button"
        title="Notifications"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-border/50 hover:text-primary"
      >
        <Bell className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        title={theme === "dark" ? "Light Mode" : "Dark Mode"}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-border/50 hover:text-primary"
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </button>
      <div className="flex items-center gap-2 rounded-full bg-secondary/10 py-1 pl-1 pr-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-purple font-dm-sans text-xs text-white">
          {firstInitial}
        </span>
        <span className="hidden max-w-40 truncate font-dm-sans text-sm text-primary sm:block">
          {fullName ?? "Your Pact"}
        </span>
      </div>
    </header>
      <CommitmentOptionsModal
        open={commitmentOptionsOpen}
        onClose={() => setCommitmentOptionsOpen(false)}
        onSelect={(type) => {
          setCommitmentType(type);
          setCommitmentOptionsOpen(false);
          setCommitmentOpen(true);
        }}
      />
      <CommitmentModal
        open={commitmentOpen}
        type={commitmentType}
        evaluationTime={evaluationTime}
        onClose={() => setCommitmentOpen(false)}
      />
    </>
  );
}