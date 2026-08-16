"use client";

import { Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const HOURS_12 = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0")
);
const PERIODS = ["AM", "PM"] as const;

function parseTime(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return {
    hour12: hour % 12 === 0 ? 12 : hour % 12,
    minute,
    period: (hour >= 12 ? "PM" : "AM") as "AM" | "PM",
  };
}

function formatTime(value: string) {
  const parsed = parseTime(value);
  if (!parsed) return "";
  return `${parsed.hour12}:${String(parsed.minute).padStart(2, "0")} ${parsed.period}`;
}

function buildValue(h12: number, m: number, p: "AM" | "PM") {
  const h24 = (h12 % 12) + (p === "PM" ? 12 : 0);
  return `${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TimePicker({ value, onChange }: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const parsed = parseTime(value);
  const [draftHour, setDraftHour] = useState(parsed?.hour12 ?? 12);
  const [draftMinute, setDraftMinute] = useState(parsed?.minute ?? 0);
  const [draftPeriod, setDraftPeriod] = useState<"AM" | "PM">(
    parsed?.period ?? "PM"
  );

  useEffect(() => {
    if (!open) return;

    const handleDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const openPicker = () => {
    const current = parseTime(value);
    setDraftHour(current?.hour12 ?? 12);
    setDraftMinute(current?.minute ?? 0);
    setDraftPeriod(current?.period ?? "PM");
    setOpen(true);
  };

  const handleUpdate = () => {
    onChange(buildValue(draftHour, draftMinute, draftPeriod));
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={openPicker}
        className="flex cursor-pointer items-center gap-2 rounded-lg border-1 border-border bg-background px-3 py-2 font-dm-sans text-xs text-muted transition-colors hover:border-secondary"
      >
        <Clock className="h-3.5 w-3.5 text-secondary" />
        <span>Evaluation deadline</span>
        <span className="font-bold text-primary">
          {formatTime(value)}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 flex flex-col gap-2 rounded-2xl border-1 border-border bg-surface p-3 shadow-xl">
          <div className="flex gap-2">
            <div className="max-h-48 overflow-y-auto rounded-xl border-1 border-border">
              {HOURS_12.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setDraftHour(Number(h))}
                  className={`block w-12 cursor-pointer px-2 py-1 text-center font-dm-sans text-sm transition-colors ${
                    h === String(draftHour)
                      ? "bg-secondary font-bold text-white"
                      : "text-primary hover:bg-secondary/10"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
            <div className="max-h-48 overflow-y-auto rounded-xl border-1 border-border">
              {MINUTES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDraftMinute(Number(m))}
                  className={`block w-12 cursor-pointer px-2 py-1 text-center font-dm-sans text-sm transition-colors ${
                    m === String(draftMinute).padStart(2, "0")
                      ? "bg-secondary font-bold text-white"
                      : "text-primary hover:bg-secondary/10"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="flex flex-col rounded-xl border-1 border-border">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setDraftPeriod(p)}
                  className={`w-12 cursor-pointer px-2 py-2 text-center font-dm-sans text-sm transition-colors ${
                    p === draftPeriod
                      ? "bg-secondary font-bold text-white"
                      : "text-primary hover:bg-secondary/10"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={handleUpdate}
            className="w-full cursor-pointer rounded-lg border-1 border-border bg-surface py-1.5 font-dm-sans text-sm font-bold text-primary shadow-sm transition-colors hover:bg-border/50"
          >
            Update
          </button>
        </div>
      )}
    </div>
  );
}
