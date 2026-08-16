"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "Select a date",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const base = value ? new Date(`${value}T00:00:00`) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const ref = useRef<HTMLDivElement>(null);

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

  const selectedDate = value ? new Date(`${value}T00:00:00`) : null;
  const today = new Date();

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const goMonth = (offset: number) =>
    setViewMonth(new Date(year, month + offset, 1));

  const display = selectedDate
    ? selectedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const cells = Array.from(
    { length: daysInMonth },
    (_, i) => new Date(year, month, i + 1)
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full cursor-pointer items-center gap-3 rounded-xl border-1 border-border bg-transparent px-4 py-2 font-dm-sans text-sm text-primary shadow-sm transition-colors hover:border-secondary focus:outline-none"
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-secondary" />
        <span className={selectedDate ? "text-primary" : "text-muted"}>
          {display || placeholder}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border-1 border-border bg-surface p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => goMonth(-1)}
              className="cursor-pointer rounded-lg p-1 text-muted transition-colors hover:bg-border/50 hover:text-primary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-manrope text-sm font-bold text-primary">
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              onClick={() => goMonth(1)}
              className="cursor-pointer rounded-lg p-1 text-muted transition-colors hover:bg-border/50 hover:text-primary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((day) => (
              <span
                key={day}
                className="py-1 text-center font-dm-sans text-[10px] font-bold uppercase text-muted"
              >
                {day}
              </span>
            ))}
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <span key={`blank-${i}`} />
            ))}
            {cells.map((date) => {
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isToday = isSameDay(date, today);
              const isPast = date < today && !isToday;
              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  disabled={isPast}
                  onClick={() => {
                    onChange(
                      `${date.getFullYear()}-${String(
                        date.getMonth() + 1
                      ).padStart(2, "0")}-${String(date.getDate()).padStart(
                        2,
                        "0"
                      )}`
                    );
                    setOpen(false);
                  }}
                  className={`cursor-pointer rounded-lg py-1.5 text-center font-dm-sans text-sm transition-colors ${
                    isPast
                      ? "cursor-not-allowed text-border"
                      : isSelected
                        ? "bg-secondary font-bold text-white"
                        : isToday
                          ? "border-1 border-secondary font-bold text-secondary hover:bg-secondary/10"
                          : "text-primary hover:bg-secondary/10"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
