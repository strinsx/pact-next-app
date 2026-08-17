"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Welcome from "@/app/components/Welcome";
import CumulativeProgressChart from "@/app/components/CumulativeProgressChart";
import DailyCompleted from "@/app/components/DailyCompleted";
import DailyMissed from "@/app/components/DailyMissed";
import CommitmentCard from "@/app/components/CommitmentCard";
import { getCurrentUser } from "@/app/lib/services/auth";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUser();

      if (!user) {
        router.push("/auth/login");
        return;
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
      <main className="flex flex-1 flex-col px-4 pb-10 text-center pt-4 md:pt-4">
        <div className="m-auto flex w-full max-w-7xl flex-col items-center gap-2 mt-10">
          <div className="mt-2 w-full">
            <Welcome />
          </div>
          <div className="mt-10 flex w-full flex-col  gap-5  lg:flex-row lg:items-stretch">
            <CumulativeProgressChart />
            <div className="flex flex-1 flex-col gap-6">
              <DailyCompleted />
              <DailyMissed />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
