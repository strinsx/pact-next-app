"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import StatCards from "@/app/components/StatCards";
import CommitmentCard from "@/app/components/CommitmentCard";
import MonthlyAnalysisCard from "@/app/components/MonthlyAnalysisCard";
import MonthlyConsistencyCard from "@/app/components/MonthlyConsistencyCard";import YearlyHeatmapCard from "@/app/components/YearlyHeatmapCard";
import GroupFeedCard from "@/app/components/GroupFeedCard";
import GroupFeedbackCard from "@/app/components/GroupFeedbackCard";
import { getCurrentUser } from "@/app/lib/services/auth";

export default function Home() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("there");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const fullName = user.user_metadata?.full_name as string | undefined;
      if (fullName) {
        setFirstName(fullName.trim().split(/\s+/)[0] || "there");
      }

      setLoading(false);
    };

    loadUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center font-dm-sans text-sm text-muted">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col px-4 pt-20 pb-10 text-center md:pt-10">
        <div className="m-auto flex w-full max-w-7xl flex-col items-center gap-2 mt-10">
          <div className="mt-6 w-full">
            <StatCards />
          </div>
          <div className="mt-2 w-full">
            <CommitmentCard />
          </div>
          <div id="analytics" className="w-full scroll-mt-4">
            <div className="mt-2 flex w-full flex-col justify-center gap-4 md:flex-row">
              <MonthlyAnalysisCard />
              <MonthlyConsistencyCard />
            </div>
            <div className="mt-2 hidden w-full gap-4 md:flex">
              <div className="w-[70%]">
                <YearlyHeatmapCard />
              </div>
              <div className="w-[30%]">
                <GroupFeedbackCard />
              </div>
            </div>
          </div>
          <div className="mt-2 w-full">
            <GroupFeedCard />
          </div>
        </div>
      </main>
    </div>
  );
}
