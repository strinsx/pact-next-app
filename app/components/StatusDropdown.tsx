"use client";

import { CheckCircle2, ChevronDown, Clock, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface StatusOption {
  value: string;
  label: string;
}

const statusIcons = {
  pending: { icon: Clock, className: "text-purple", bg: "bg-purple/10" },
  submitted: { icon: CheckCircle2, className: "text-teal", bg: "bg-teal/10" },
  missed: { icon: TriangleAlert, className: "text-red-500", bg: "bg-red-500/10" },
} as const;

interface StatusDropdownProps {
  value: string;
  options: StatusOption[];
  onChange: (value: string) => void;
}

export default function StatusDropdown({
  value,
  options,
  onChange,
}: StatusDropdownProps) {
  const [open, setOpen] = useState(false);
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

  const current =
    options.find((o) => o.value === value) ?? options[0];

  const selectedStyle = statusIcons[value as keyof typeof statusIcons] ?? {
    icon: Clock,
    className: "text-primary",
  };
  const SelectedIcon = selectedStyle.icon;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border-1 border-border bg-transparent px-4 py-2 font-dm-sans text-sm text-primary shadow-sm transition-colors hover:border-secondary focus:outline-none"
      >
        <span className="flex items-center gap-2">
          <SelectedIcon className={`h-4 w-4 ${selectedStyle.className}`} />
          {current?.label ?? ""}
        </span>
        <ChevronDown className="h-4 w-4 text-muted" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-2xl border-1 border-border bg-surface p-1 shadow-xl">
          {options.map((option) => {
            const style = statusIcons[option.value as keyof typeof statusIcons];
            const Icon = style?.icon ?? Clock;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left font-dm-sans text-sm transition-colors ${
                  style?.bg ?? "bg-secondary/10"
                } ${
                  option.value === value
                    ? "font-bold text-primary"
                    : "text-muted"
                }`}
              >
                <Icon className={`h-4 w-4 ${style?.className ?? "text-primary"}`} />
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
