"use client";

import { Flame } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  XAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/app/components/ui/chart";
import { getCurrentUser } from "@/app/lib/services/auth";
import { getProfileByUserId } from "@/app/lib/services/profile";
import {
  getMonthlyConsistency,
  MonthlyConsistencyDatum,
} from "@/app/lib/services/commitments";
import { subscribeDataChanged } from "@/app/lib/events";

const chartConfig: ChartConfig = {
  value: {
    label: "Consistency",
    color: "#4a90f5",
  },
};

export default function MonthlyConsistencyCard() {
  const [data, setData] = useState<MonthlyConsistencyDatum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMonthly = async () => {
      const user = await getCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await getProfileByUserId(user.id, "id");

      if (!profile) {
        setLoading(false);
        return;
      }

      setData(await getMonthlyConsistency(profile.id));
      setLoading(false);
    };

    loadMonthly();
    return subscribeDataChanged(loadMonthly);
  }, []);

  const avg =
    data.length > 0
      ? Math.round(
          data.reduce((sum, d) => sum + d.value, 0) / data.length
        )
      : 0;

  return (
    <div className="w-full flex-1 rounded-2xl border-1 border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-manrope text-xl font-bold text-primary">
          Monthly Consistency
        </h2>
        <span className="flex items-center gap-2 rounded-full bg-purple/10 px-3 py-1 font-dm-sans text-xs font-bold text-purple">
          <Flame className="h-3.5 w-3.5" />
          {loading ? "..." : `${avg}% avg`}
        </span>
      </div>
      <div className="mt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-36 w-full">
          <RechartsAreaChart
            data={data}
            margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-value)"
                  stopOpacity={0.5}
                />
                <stop
                  offset="95%"
                  stopColor="#56d9c8"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Area
              dataKey="value"
              type="monotone"
              fill="url(#fillValue)"
              stroke="var(--color-value)"
              strokeWidth={2}
            />
          </RechartsAreaChart>
        </ChartContainer>
      </div>
    </div>
  );
}
