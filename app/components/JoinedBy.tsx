const people = [
  { id: 1, initials: "AJ", gradient: "from-sky-400 to-secondary" },
  { id: 2, initials: "MK", gradient: "from-purple to-secondary" },
  { id: 3, initials: "SR", gradient: "from-teal to-secondary" },
  { id: 4, initials: "PL", gradient: "from-secondary to-purple" },
];

export default function JoinedBy() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex -space-x-2">
        {people.map((person) => (
          <div
            key={person.id}
            className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r ${person.gradient} font-dm-sans text-xs font-bold text-white ring-2 ring-background`}
          >
            {person.initials}
          </div>
        ))}
      </div>
      <span className="font-dm-sans text-sm text-muted">
        Joined by people building real streaks, not vanity ones
      </span>
    </div>
  );
}
