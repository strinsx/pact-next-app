import { Sparkles } from "lucide-react";

export default function HeroBadge() {
  return (
    <div className="animate-[float_4s_ease-in-out_infinite] inline-flex items-center gap-2 rounded-full border-1 border-border bg-surface px-4 py-2 shadow-lg">
      <Sparkles className="h-4 w-4 text-secondary" />
      <span className="font-nunito text-sm font-semibold text-primary">
        Accountability over willpower.
      </span>
    </div>
  );
}
