"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";

export default function Onboarding() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("User");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.push("/auth/login");
        return;
      }

      const fullName = data.user.user_metadata?.full_name as string | undefined;
      if (fullName) {
        setFirstName(fullName.trim().split(/\s+/)[0] || "User");
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (profile?.username) {
        router.push("/");
        return;
      }

      setLoading(false);
    };

    loadUser();
  }, [router]);

  const handleContinue = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmed = username.trim();
    if (!trimmed) {
      setError("Please enter a username.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ username: trimmed })
        .eq("user_id", user.id);

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="font-poppins text-3xl font-bold text-primary">
        Hello {firstName}
      </h1>
      <p className="mt-2 font-poppins text-sm font-semibold text-muted">
        Choose a username to start your Pact
      </p>
      <form
        onSubmit={handleContinue}
        className="mt-8 flex w-full max-w-sm flex-col gap-5 rounded-2xl border-1 border-border bg-surface p-8"
      >
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
        <button
          type="submit"
          disabled={loading || saving}
          className="mt-2 w-full cursor-pointer rounded-xl bg-secondary py-1 font-nunito font-bold text-md text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowRight className="mr-2 h-4 w-4 text-white/70" />
          {saving ? "Continuing..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
