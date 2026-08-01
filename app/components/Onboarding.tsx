"use client";

import { User, UserPlus, UserRoundPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/app/lib/services/auth";
import { getProfileByUserId, updateUsername } from "@/app/lib/services/profile";

export default function Onboarding() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("User");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      const { data: profile } = await getProfileByUserId(user.id, "username");

      if (profile?.username) {
        router.push("/");
        return;
      }

      setLoading(false);
    };

    loadUser();
  }, [router]);

  const saveUsername = async () => {
    const trimmed = username.trim();
    if (!trimmed) return;

    const user = await getCurrentUser();

    if (user) {
      const { error: updateError } = await updateUsername(user.id, trimmed);

      if (updateError) {
        setError(updateError.message);
        return;
      }
    }
  };

  const handleChoose = async (mode: "create" | "join" | "solo") => {
    setError(null);
    setSaving(true);
    await saveUsername();
    setSaving(false);

    if (mode === "create") {
      router.push("/groups/create");
    } else if (mode === "join") {
      router.push("/groups/join");
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="font-poppins text-3xl font-bold text-primary">
        Hello {firstName}
      </h1>
      <p className="mt-2 font-poppins text-sm font-semibold text-muted">
        Choose a username to start your Pact
      </p>
      <div className="mt-8 flex w-full max-w-sm flex-col gap-5 rounded-2xl border-1 border-border bg-surface p-8">
        {error && (
          <p className="rounded-lg border-1 border-red-500/30 bg-red-500/10 px-3 py-2 font-nunito text-sm text-red-500">
            {error}
          </p>
        )}
        <h2 className="font-poppins text-sm font-light text-secondary">
          Username
        </h2>
        <input
          type="text"
          placeholder="@yourname"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full rounded-xl border-1 border-border bg-transparent py-1 px-4 font-nunito text-sm text-primary shadow-sm placeholder:text-muted focus:outline-none"
        />
        <p className="mt-[-12px] font-nunito text-xs text-muted/50">
          This will be your public handle in groups
        </p>
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="font-nunito text-xs font-semibold uppercase tracking-wide text-muted/50">
            How do you want to start?
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <button
          type="button"
          onClick={() => handleChoose("create")}
          disabled={loading || saving}
          className="w-full cursor-pointer rounded-xl border-1 border-border bg-surface py-1 font-nunito font-bold text-md text-primary shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UserRoundPlus className="mr-2 inline h-4 w-4 text-secondary" />
          Create Group
        </button>
        <button
          type="button"
          onClick={() => handleChoose("join")}
          disabled={loading || saving}
          className="w-full cursor-pointer rounded-xl border-1 border-border bg-surface py-1 font-nunito font-bold text-md text-primary shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UserPlus className="mr-2 inline h-4 w-4 text-secondary" />
          Join Group
        </button>
        <button
          type="button"
          onClick={() => handleChoose("solo")}
          disabled={loading || saving}
          className="w-full cursor-pointer rounded-xl border-1 border-border bg-surface py-1 font-nunito font-bold text-md text-primary shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          <User className="mr-2 inline h-4 w-4 text-secondary" />
          Solo
        </button>
      </div>
    </div>
  );
}
