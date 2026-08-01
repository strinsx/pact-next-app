"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { getPostAuthDestination } from "@/app/lib/auth/redirect";

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const handleCallback = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();

      if (cancelled) return;

      if (error || !data.user) {
        setError("Sign-in could not be completed. Please try again.");
        return;
      }

      const fullName =
        data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? null;

      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (cancelled) return;

      if (!existing) {
        const { error: insertError } = await supabase.from("profiles").insert({
          id: crypto.randomUUID(),
          user_id: data.user.id,
          full_name: fullName,
        });

        if (cancelled) return;

        if (insertError) {
          setError(insertError.message);
          return;
        }
      }

      const destination = await getPostAuthDestination(data.user.id);
      if (cancelled) return;

      router.push(destination);
    };

    handleCallback();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="rounded-lg border-1 border-red-500/30 bg-red-500/10 px-3 py-2 font-nunito text-sm text-red-500">
          {error}
        </p>
        <Link href="/auth/login" className="font-bold text-primary">
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center font-nunito text-sm text-muted">
      Signing you in...
    </div>
  );
}
