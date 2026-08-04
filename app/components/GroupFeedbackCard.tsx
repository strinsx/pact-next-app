"use client";

import { Crown, MessagesSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/app/lib/services/auth";
import { getProfileByUserId } from "@/app/lib/services/profile";
import { getGroupFeed, FeedPost } from "@/app/lib/services/feed";
import { subscribeDataChanged } from "@/app/lib/events";

export default function GroupFeedbackCard() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const user = await getCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await getProfileByUserId(user.id, "id");

      if (!profile) {
        setLoading(false);
        return;
      }

      setPosts(await getGroupFeed(profile.id, 3));
      setLoading(false);
    };

    load();
    return subscribeDataChanged(load);
  }, []);

  return (
    <div className="flex w-full flex-col rounded-2xl border-1 border-border bg-surface p-5">
      <div className="flex items-center gap-2">
        <MessagesSquare className="h-4 w-4 text-secondary" />
        <h2 className="font-poppins text-lg font-bold text-primary">
          Group Feedback
        </h2>
      </div>
      <p className="mt-1 text-left font-nunito text-xs text-muted">
        Latest activity
      </p>
      <div className="feed-scroll mt-4 max-h-[280px] flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {loading && posts.length === 0 ? (
          <p className="py-10 text-center font-nunito text-sm text-muted">
            Loading...
          </p>
        ) : posts.length === 0 ? (
          <p className="py-10 text-center font-nunito text-sm text-muted">
            No activity yet.
          </p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="rounded-xl border-1 border-border bg-background px-3 py-2.5 text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-purple font-nunito text-xs font-bold text-white">
                  {post.name[0].toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-nunito text-xs font-semibold text-primary">
                    {post.group}
                  </span>
                  <span className="flex items-center gap-1 font-nunito text-[11px] text-muted">
                    <Crown className="h-3 w-3 text-secondary" />
                    {post.name} · {post.time}
                  </span>
                </div>
              </div>
              <p className="mt-2 font-nunito text-xs">
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
          ))
        )}
      </div>
    </div>
  );
}
