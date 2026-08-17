"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/app/lib/services/auth";

export default function Welcome() {
  const [firstName, setFirstName] = useState("there");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const fullName = user.user_metadata?.full_name as string | undefined;
      if (fullName) {
        setFirstName(fullName.trim().split(/\s+/)[0] || "there");
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex w-full items-center justify-between gap-4 text-left">
      <div>
        <h1 className="font-manrope text-3xl font-bold text-primary">
          {loading ? "Welcome" : `${greeting}, ${firstName}`}
        </h1>
        <p className="mt-2 font-dm-sans text-sm text-muted">
          Keep going - consistency builds momentum over time.
        </p>
      </div>
      <span className="shrink-0 font-dm-sans text-sm font-semibold text-muted">
        {currentDate}
      </span>
    </div>
  );
}