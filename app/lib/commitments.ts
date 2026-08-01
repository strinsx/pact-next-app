export type CommitmentType = "standard" | "routine" | "scheduled";
export type CommitmentStatus = "pending" | "submitted" | "missed";

export const DAYS_OF_WEEK: { value: number; label: string }[] = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 7, label: "Sun" },
];

export const COMMITMENT_TYPES: {
  value: CommitmentType;
  label: string;
  description: string;
}[] = [
  {
    value: "standard",
    label: "Standard",
    description: "A one-off commitment you check off",
  },
  {
    value: "routine",
    label: "Routinary",
    description: "Repeat on days you pick as part of your routine",
  },
  {
    value: "scheduled",
    label: "Scheduled",
    description: "Commit on specific days or times",
  },
];
