import { CheckCircle2 } from "lucide-react";
import AreaChart from "@/app/components/AreaChart";

const dailyData = [
  { label: "Mon", value: 3 },
  { label: "Tue", value: 5 },
  { label: "Wed", value: 2 },
  { label: "Thu", value: 6 },
  { label: "Fri", value: 4 },
  { label: "Sat", value: 7 },
  { label: "Sun", value: 5 },
];

export default function DailyCommitmentsCard() {
  return (
    <div className="w-full flex-1 rounded-2xl border-1 border-border bg-surface p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-poppins text-xl font-bold text-primary">
          Daily Commitments
        </h2>
        <span className="flex items-center gap-2 rounded-full bg-teal/10 px-3 py-1 font-nunito text-xs font-bold text-teal">
          <CheckCircle2 className="h-3.5 w-3.5" />
          32 completed
        </span>
      </div>
      <div className="mt-6">
        <AreaChart data={dailyData} from="#38bdf8" to="#a37af7" id="dailyGrad" />
        <div className="mt-2 flex justify-between">
          {dailyData.map((day) => (
            <span
              key={day.label}
              className="font-nunito text-xs text-muted"
            >
              {day.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
