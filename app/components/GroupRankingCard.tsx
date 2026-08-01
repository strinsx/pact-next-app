import { Trophy } from "lucide-react";

const members = [
  { id: 1, name: "albert", score: 92 },
  { id: 2, name: "sarah", score: 78 },
  { id: 3, name: "chika", score: 64 },
  { id: 4, name: "mike", score: 51 },
  { id: 5, name: "john", score: 35 },
];

export default function GroupRankingCard() {
  const max = members[0].score;

  return (
    <div className="w-full flex-1 rounded-2xl border-1 border-border bg-surface p-6">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-secondary" />
        <h2 className="text-left font-poppins text-xl font-bold text-primary">
          Group Ranking
        </h2>
      </div>
      <p className="mt-1 text-left font-nunito text-xs text-muted">
        Ranking for this month
      </p>
      <p className="text-left font-nunito text-xs text-muted/50">
        Who has been the most consistent?
      </p>
      <ul className="mt-4 flex flex-col gap-3">
        {members.map((member) => (
          <li
            key={member.id}
            className="flex items-center gap-3 text-left"
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-nunito text-xs font-bold ${
                member.id === 1
                  ? "bg-gradient-to-r from-sky-400 to-purple text-white"
                  : "bg-border/50 text-muted"
              }`}
            >
              {member.id}
            </span>
            <span className="w-20 shrink-0 font-nunito text-sm font-semibold text-primary">
              {member.name}
            </span>
            <div className="flex flex-1 items-center gap-3">
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-border/50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-purple"
                  style={{ width: `${(member.score / max) * 100}%` }}
                />
              </div>
              <span className="w-8 text-right font-nunito text-sm font-bold text-primary">
                {member.score}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
