"use client";

import { ArrowLeftRight, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/app/components/ui/chart";

interface CumulativePoint {
  label: string;
  value: number;
}

type View = "week" | "month";

const weekData: CumulativePoint[] = [
  { label: "Aug 10", value: 55 },
  { label: "Aug 11", value: 73 },
  { label: "Aug 12", value: 58 },
  { label: "Aug 13", value: 68 },
  { label: "Aug 14", value: 63 },
  { label: "Aug 15", value: 66 },
  { label: "Aug 16", value: 66 },
];

const monthData: CumulativePoint[] = [
  { label: "Aug 1", value: 8 },
  { label: "Aug 2", value: 12 },
  { label: "Aug 3", value: 18 },
  { label: "Aug 4", value: 24 },
  { label: "Aug 5", value: 24 },
  { label: "Aug 6", value: 31 },
  { label: "Aug 7", value: 31 },
  { label: "Aug 8", value: 39 },
  { label: "Aug 9", value: 39 },
  { label: "Aug 10", value: 45 },
  { label: "Aug 11", value: 52 },
  { label: "Aug 12", value: 52 },
  { label: "Aug 13", value: 58 },
  { label: "Aug 14", value: 58 },
  { label: "Aug 15", value: 63 },
  { label: "Aug 16", value: 63 },
  { label: "Aug 17", value: 68 },
  { label: "Aug 18", value: 68 },
  { label: "Aug 19", value: 72 },
  { label: "Aug 20", value: 72 },
  { label: "Aug 21", value: 76 },
  { label: "Aug 22", value: 76 },
  { label: "Aug 23", value: 81 },
  { label: "Aug 24", value: 81 },
  { label: "Aug 25", value: 84 },
  { label: "Aug 26", value: 84 },
  { label: "Aug 27", value: 88 },
  { label: "Aug 28", value: 88 },
  { label: "Aug 29", value: 91 },
  { label: "Aug 30", value: 91 },
  { label: "Aug 31", value: 94 },
];

const GRID_VALUES = [0, 25, 50, 75, 100];

const ACCENT = "#a37af7";

const chartConfig: ChartConfig = {
  value: {
    label: "Progress",
    color: ACCENT,
  },
};

export default function CumulativeProgressChart() {
  const [view, setView] = useState<View>("month");

  const data = view === "week" ? weekData : monthData;
  const n = data.length;

  const label = view === "week" ? "This Week" : "This Month";

  const paceStart = data[0].value;

  const last = data[n - 1];

  return (
    <div className="w-full max-w-4xl border-1 border-border bg-surface p-5 text-left">
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="font-manrope text-lg font-bold text-primary">
            Your progress overtime
          </h1>
          <p className="mt-1 font-dm-sans text-xs text-muted">
            Cumulative share of commitments kept from day 1 to today
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 rounded-full bg-purple/10 px-3 py-1 font-dm-sans text-xs font-bold text-purple">
            <TrendingUp className="h-3.5 w-3.5" />
            {Math.round(last.value)}% now
          </span>
          <span className="flex items-center gap-2 rounded-full border-1 border-dashed border-muted/40 px-3 py-1 font-dm-sans text-xs font-bold text-muted">
            <span className="w-4 border-t-2 border-dashed border-muted/70" />
            Expected pace
          </span>
          <button
            type="button"
            onClick={() => setView((prev) => (prev === "week" ? "month" : "week"))}
            title={`Switch to ${view === "week" ? "This Month" : "This Week"}`}
            className="flex cursor-pointer items-center gap-2 rounded-full border-1 border-border bg-surface px-4 py-1 font-dm-sans text-xs font-bold text-primary shadow-sm transition-colors hover:bg-border/50"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            {label}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-52 w-full font-dm-sans"
        >
          <RechartsAreaChart
            data={data}
            margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="cumulativeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACCENT} stopOpacity="0.16" />
                <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
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
            <YAxis
              domain={[0, 100]}
              ticks={GRID_VALUES}
              tickLine={false}
              axisLine={false}
              width={38}
              tickMargin={4}
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) => `${value}%`}
                />
              }
            />
            <ReferenceLine
              y={100}
              stroke={ACCENT}
              strokeOpacity={0.45}
              strokeWidth={1.25}
            />
            <ReferenceLine
              segment={[
                { x: data[0].label, y: paceStart },
                { x: data[n - 1].label, y: 100 },
              ]}
              stroke="#9aa3b8"
              strokeWidth={1.25}
              strokeDasharray="2 6"
              strokeLinecap="round"
            />
            <Area
              dataKey="value"
              type="monotone"
              stroke={ACCENT}
              strokeWidth={2}
              fill="url(#cumulativeGrad)"
              dot={(props) => {
                const cx = props.cx ?? 0;
                const cy = props.cy ?? 0;
                const index = props.index;
                const isLast = index === n - 1;
                return (
                  <g key={`dot-${index}`}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isLast ? 4.5 : 2}
                      fill={ACCENT}
                      stroke="#ffffff"
                      strokeWidth={isLast ? 1.5 : 0.75}
                    />
                    {isLast && (
                      <g>
                        <rect
                          x={cx - 16}
                          y={cy - 27}
                          width={32}
                          height={22}
                          rx={11}
                          fill="#ffffff"
                          stroke="#e4e7f5"
                        />
                        <text
                          x={cx}
                          y={cy - 13}
                          textAnchor="middle"
                          fill={ACCENT}
                          className="font-dm-sans"
                          style={{ fontSize: 10.5, fontWeight: 700 }}
                        >
                          {last.value}%
                        </text>
                      </g>
                    )}
                  </g>
                );
              }}
              activeDot={{ r: 4.5, fill: ACCENT, stroke: "#ffffff", strokeWidth: 1.5 }}
            />
          </RechartsAreaChart>
        </ChartContainer>
      </div>
    </div>
  );
}
