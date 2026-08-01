import { Target, ClipboardCheck, Flame } from "lucide-react";

const stats = [
  { label: "Completion Rate", value: "86%", icon: Target },
  { label: "Commitments Submitted", value: "12", icon: ClipboardCheck },
  { label: "Day Streak", value: "7", icon: Flame },
];

export default function StatCards() {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <h2 className="self-start font-poppins text-xl font-bold text-primary">
       Your Personal Stats
      </h2>
      <div className="flex flex-wrap justify-center gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex w-100 flex-col gap-2 rounded-2xl border-1 border-border bg-surface p-6 text-left"
          >
            <stat.icon className="h-5 w-5 text-muted" />
            <span className="bg-gradient-to-r from-purple to-secondary bg-clip-text font-poppins text-3xl font-bold text-transparent">
              {stat.value}
            </span>
            <span className="font-nunito text-sm text-muted">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
