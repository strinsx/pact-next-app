import { Crown, ShieldCheck, User } from "lucide-react";

type Role = "Owner" | "Admin" | "Member";

const members: { id: number; name: string; username: string; role: Role }[] = [
  { id: 1, name: "albert", username: "@albert", role: "Owner" },
  { id: 2, name: "sarah", username: "@sarah", role: "Admin" },
  { id: 3, name: "chika", username: "@chika", role: "Admin" },
  { id: 4, name: "mike", username: "@mike", role: "Member" },
  { id: 5, name: "john", username: "@john", role: "Member" },
];

const roleStyles = {
  Owner: "bg-gradient-to-r from-sky-400 to-purple text-white",
  Admin: "bg-secondary/10 text-secondary",
  Member: "bg-border/50 text-muted",
} as const;

const roleIcons = {
  Owner: Crown,
  Admin: ShieldCheck,
  Member: User,
} as const;

export default function MembersCard() {
  return (
    <div className="w-full">
      <h2 className="self-start font-poppins text-xl font-bold text-primary">
        Members
      </h2>
      <div className="mt-4 w-full rounded-2xl border-1 border-border bg-surface p-6">
        <ul className="flex flex-col gap-3">
          {members.map((member) => {
            const RoleIcon = roleIcons[member.role];
            return (
              <li
                key={member.id}
                className="flex items-center justify-between rounded-xl border-1 border-border bg-background px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-purple font-nunito text-sm font-bold text-white">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-nunito text-sm font-semibold text-primary">
                      {member.name}
                    </span>
                    <span className="font-nunito text-xs text-muted">
                      {member.username}
                    </span>
                  </div>
                </div>
                <span
                  className={`flex items-center gap-2 rounded-full px-3 py-1 font-nunito text-xs font-bold ${roleStyles[member.role]}`}
                >
                  <RoleIcon className="h-3.5 w-3.5" />
                  {member.role}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
