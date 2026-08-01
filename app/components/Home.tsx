"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import StatCards from "@/app/components/StatCards";
import CommitmentCard from "@/app/components/CommitmentCard";
import MonthlyAnalysisCard from "@/app/components/MonthlyAnalysisCard";
import WeeklyAnalysisCard from "@/app/components/WeeklyAnalysisCard";
import GroupFeedCard from "@/app/components/GroupFeedCard";
import GroupRankingCard from "@/app/components/GroupRankingCard";
import { createClient } from "@/app/lib/supabase/client";

export default function Home() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("there");
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
        setFirstName(fullName.trim().split(/\s+/)[0] || "there");
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (!profile?.username) {
        router.push("/auth/onboarding");
        return;
      }

      setUsername(profile.username);
      setLoading(false);
    };

    loadUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center font-nunito text-sm text-muted">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col px-4 py-10 text-center">
        <div className="m-auto flex w-full max-w-7xl flex-col items-center gap-2 mt-10">
          <div className="mt-6 w-full">
            <StatCards />
          </div>
          <div className="mt-2 w-full">
            <CommitmentCard />
          </div>
          <div className="mt-2 flex w-full justify-center gap-4">
            <MonthlyAnalysisCard />
            <WeeklyAnalysisCard />
          </div>
          <div className="mt-2 w-full">
            <GroupFeedCard />
          </div>
          <div className="mt-2 flex w-full justify-center gap-4">
            <GroupRankingCard />
          </div>
        </div>
      </main>
    </div>
  );
}
