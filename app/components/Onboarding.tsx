"use client";

import { User, UserPlus, UserRoundPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/app/lib/services/auth";
import CreateGroupModal from "@/app/components/CreateGroupModal";
import JoinGroupModal from "@/app/components/JoinGroupModal";

export default function Onboarding() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [joinGroupOpen, setJoinGroupOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const fullName = user.user_metadata?.full_name as string | undefined;
      if (fullName) {
        setFirstName(fullName.trim().split(/\s+/)[0] || "User");
      }

      setLoading(false);
    };

    loadUser();
  }, [router]);

  const handleSolo = () => {
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="font-poppins text-3xl font-bold text-primary">
        Hello {firstName}
      </h1>
      <p className="mt-2 font-poppins text-sm font-semibold text-muted">
        How do you want to start your Pact?
      </p>
      <div className="mt-8 flex w-full max-w-sm flex-col gap-5 rounded-2xl border-1 border-border bg-surface p-8">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="font-nunito text-xs font-semibold uppercase tracking-wide text-muted/50">
            How do you want to start?
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <button
          type="button"
          onClick={() => setCreateGroupOpen(true)}
          disabled={loading}
          className="w-full cursor-pointer rounded-xl border-1 border-border bg-surface py-1 font-nunito font-bold text-md text-primary shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UserRoundPlus className="mr-2 inline h-4 w-4 text-secondary" />
          Create Group
        </button>
        <button
          type="button"
          onClick={() => setJoinGroupOpen(true)}
          disabled={loading}
          className="w-full cursor-pointer rounded-xl border-1 border-border bg-surface py-1 font-nunito font-bold text-md text-primary shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UserPlus className="mr-2 inline h-4 w-4 text-secondary" />
          Join Group
        </button>
        <button
          type="button"
          onClick={handleSolo}
          disabled={loading}
          className="w-full cursor-pointer rounded-xl border-1 border-border bg-surface py-1 font-nunito font-bold text-md text-primary shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          <User className="mr-2 inline h-4 w-4 text-secondary" />
          Solo
        </button>
      </div>
      <CreateGroupModal
        open={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
        onCreated={() => router.push("/")}
      />
      <JoinGroupModal
        open={joinGroupOpen}
        onClose={() => setJoinGroupOpen(false)}
        onJoin={() => router.push("/")}
      />
    </div>
  );
}