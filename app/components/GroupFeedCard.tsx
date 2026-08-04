"use client";

import { Crown, Send, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { getCurrentUser } from "@/app/lib/services/auth";
import { getProfileByUserId } from "@/app/lib/services/profile";
import { getMyGroups, MyGroup } from "@/app/lib/services/groups";
import { getGroupFeed, FeedPost } from "@/app/lib/services/feed";

type Reactions = Record<string, { count: number; reacted: boolean }>;

interface Comment {
  id: string;
  name: string;
  text: string;
}

interface FeedItem extends FeedPost {
  reactions: Reactions;
  comments: Comment[];
}

const emojiPool = ["✅", "🔥", "👍", "❤️"];

export default function GroupFeedCard() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [myGroups, setMyGroups] = useState<MyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const profileIdRef = useRef<string | null>(null);
  const groupsLoadedRef = useRef(false);

  const load = async () => {
    const user = await getCurrentUser();
    if (!user) return;

    if (!profileIdRef.current) {
      const { data: profile } = await getProfileByUserId(user.id, "id");
      if (!profile) return;
      profileIdRef.current = profile.id;
    }

    const groups = await getMyGroups(profileIdRef.current);

    if (!groupsLoadedRef.current) {
      groupsLoadedRef.current = true;
      setMyGroups(groups);
    }

    const posts = await getGroupFeed(profileIdRef.current);

    setItems((prev) =>
      posts.map((post) => {
        const existing = prev.find((item) => item.id === post.id);
        return {
          ...post,
          reactions: existing?.reactions ?? {},
          comments: existing?.comments ?? [],
        };
      })
    );
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;

    load();

    const supabase = createClient();
    const channel = supabase
      .channel("group-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feed_posts" },
        () => {
          if (!cancelled) load();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleReaction = (postId: string, emoji: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== postId) return item;
        const reaction = item.reactions[emoji];
        return {
          ...item,
          reactions: {
            ...item.reactions,
            [emoji]: reaction
              ? {
                  ...reaction,
                  count: reaction.count + (reaction.reacted ? -1 : 1),
                  reacted: !reaction.reacted,
                }
              : { count: 1, reacted: true },
          },
        };
      })
    );
  };

  const addReaction = (postId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== postId) return item;
        const nextEmoji = emojiPool.find((e) => !item.reactions[e]);
        if (!nextEmoji) return item;
        return {
          ...item,
          reactions: {
            ...item.reactions,
            [nextEmoji]: { count: 1, reacted: true },
          },
        };
      })
    );
  };

  const addComment = (id: string) => {
    const text = (commentDrafts[id] ?? "").trim();
    if (!text) return;

    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              comments: [
                ...item.comments,
                { id: `${item.id}-${Date.now()}`, name: "you", text },
              ],
            }
          : item
      )
    );
    setCommentDrafts((prev) => ({ ...prev, [id]: "" }));
  };

  return (
    <div className="w-full flex-1 rounded-2xl border-1 border-border bg-surface p-6">
      <h2 className="text-left font-poppins text-xl font-bold text-primary">
        Group Feed
      </h2>
      {myGroups.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {myGroups.map((group) => (
            <span key={group.id} className="font-nunito text-xs text-muted">
              {group.name}
            </span>
          ))}
        </div>
      )}
      {!loading && myGroups.length === 0 ? (
        <div className="feed-scroll mt-4 flex h-96 items-center justify-center">
          <p className="font-nunito text-sm text-muted">
            Join a group to see its feed.
          </p>
        </div>
      ) : (
        <div className="feed-scroll mt-4 flex h-96 flex-col gap-4 pr-1">
          {loading && items.length === 0 ? (
            <p className="py-20 text-center font-nunito text-sm text-muted">
              Loading feed...
            </p>
          ) : items.length === 0 ? (
            <p className="py-20 text-center font-nunito text-sm text-muted">
              No posts yet. Create a commitment and it will show up here.
            </p>
          ) : (
            items.map((post) => (
              <div
                key={post.id}
                className="rounded-xl border-1 border-border bg-background px-4 py-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-purple font-nunito text-sm font-bold text-white">
                    {post.name[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-nunito text-sm font-semibold text-primary">
                      {post.group}
                    </span>
                    <span className="flex items-center gap-1 font-nunito text-xs text-muted">
                      <Crown className="h-3 w-3 text-secondary" />
                      {post.name} · {post.time}
                    </span>
                  </div>
                </div>
                <p className="mt-3 font-nunito text-sm">
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
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  {Object.entries(post.reactions).map(([emoji, reaction]) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => toggleReaction(post.id, emoji)}
                      className={`flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 font-nunito text-xs font-bold transition-colors ${
                        reaction.reacted
                          ? "bg-secondary/10 text-secondary"
                          : "bg-border/50 text-muted hover:bg-border"
                      }`}
                    >
                      <span className="text-sm">{emoji}</span>
                      {reaction.count}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => addReaction(post.id)}
                    className="flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 font-nunito text-xs font-bold text-muted transition-colors hover:bg-border"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                {post.comments.length > 0 && (
                  <ul className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                    {post.comments.map((comment) => (
                      <li
                        key={comment.id}
                        className="flex flex-col font-nunito text-xs"
                      >
                        <span className="font-bold text-primary">
                          {comment.name}
                        </span>
                        <span className="text-muted">{comment.text}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentDrafts[post.id] ?? ""}
                    onChange={(e) =>
                      setCommentDrafts((prev) => ({
                        ...prev,
                        [post.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addComment(post.id);
                    }}
                    className="w-full rounded-lg border-1 border-border bg-surface px-3 py-1.5 font-nunito text-xs text-primary placeholder:text-muted focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addComment(post.id)}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-sky-400 to-purple px-3 py-1.5 font-nunito text-xs font-bold text-white transition-opacity hover:opacity-90"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
