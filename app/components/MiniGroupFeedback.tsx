"use client";

import { MessagesSquare, Crown } from "lucide-react";

const miniPosts = [
  {
    id: 1,
    name: "albert",
    group: "Gym Rats",
    time: "2h",
    content: "completed today's workout",
    type: "submitted",
    reaction: "✅ 12",
  },
  {
    id: 2,
    name: "sarah",
    group: "Early Birds",
    time: "5h",
    content: "missed morning run",
    type: "missed",
    reaction: "🔥 4",
  },
  {
    id: 3,
    name: "mike",
    group: "Gym Rats",
    time: "1d",
    content: "posted a status update",
    type: "post",
    reaction: "👍 8",
  },
];

export default function MiniGroupFeedback() {
  return (
    <div className="w-full max-w-md justify-self-center rounded-[20px] border-1 border-border bg-surface p-6 shadow-xl animate-[float_4s_ease-in-out_infinite] lg:justify-self-end">
      <div className="flex items-center gap-2">
        <MessagesSquare className="h-5 w-5 text-secondary" />
        <h3 className="font-manrope text-lg font-bold text-primary">
          Group Feedback
        </h3>
      </div>
      <p className="mt-1 font-dm-sans text-xs text-muted">Live from your group</p>

      <div className="mt-4 flex flex-col gap-3">
        {miniPosts.map((post) => (
          <div
            key={post.id}
            className="rounded-xl border-1 border-border bg-background px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-purple font-dm-sans text-xs font-bold text-white">
                {post.name[0].toUpperCase()}
              </div>
              <div className="flex flex-1 flex-col">
                <span className="font-dm-sans text-sm font-semibold text-primary">
                  {post.group}
                </span>
                <span className="flex items-center gap-1 font-dm-sans text-xs text-muted">
                  <Crown className="h-3 w-3 text-secondary" />
                  {post.name} · {post.time}
                </span>
              </div>
              <span className="rounded-full bg-border/50 px-2.5 py-1 font-dm-sans text-xs font-bold text-primary">
                {post.reaction}
              </span>
            </div>
            <p className="mt-2 font-dm-sans text-sm">
              <span className="font-bold text-primary">{post.name}</span>{" "}
              <span
                className={
                  post.type === "submitted"
                    ? "text-emerald-500"
                    : post.type === "missed"
                      ? "text-red-500"
                      : "text-primary"
                }
              >
                {post.content}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
