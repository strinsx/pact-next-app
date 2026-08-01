"use client";

import { Crown, Send, Plus } from "lucide-react";
import { useState } from "react";

type Reactions = Record<string, { count: number; reacted: boolean }>;

interface Comment {
  id: number;
  name: string;
  text: string;
}

interface FeedPost {
  id: number;
  group: string;
  name: string;
  content: string;
  time: string;
  reactions: Reactions;
  comments: Comment[];
}

const emojiPool = ["✅", "🔥", "👍", "❤️"];

const initialPosts: FeedPost[] = [
  {
    id: 1,
    group: "Fitness Pact",
    name: "albert",
    content: 'completed "morning run 5km"',
    time: "submitted 6:40pm",
    reactions: {
      "✅": { count: 3, reacted: false },
      "🔥": { count: 2, reacted: false },
    },
    comments: [
      { id: 1, name: "sarah", text: "Let's go! Keep it up." },
      { id: 2, name: "mike", text: "Solid pace." },
    ],
  },
  {
    id: 2,
    group: "Book Club",
    name: "sarah",
    content: "New chapter summary is up. Everyone, drop your thoughts below.",
    time: "posted 5h ago",
    reactions: {
      "👍": { count: 5, reacted: false },
      "❤️": { count: 2, reacted: false },
    },
    comments: [{ id: 1, name: "albert", text: "Reading it tonight." }],
  },
  {
    id: 3,
    group: "Fitness Pact",
    name: "mike",
    content: 'completed "evening gym session"',
    time: "submitted 8:15pm",
    reactions: {
      "🔥": { count: 4, reacted: false },
      "💪": { count: 3, reacted: false },
    },
    comments: [
      { id: 1, name: "albert", text: "Beast mode!" },
      { id: 2, name: "sarah", text: "Proud of you." },
    ],
  },
  {
    id: 4,
    group: "Language Swap",
    name: "priya",
    content: 'completed "30 min Spanish listening"',
    time: "submitted 9:02pm",
    reactions: {
      "✅": { count: 2, reacted: false },
      "❤️": { count: 1, reacted: false },
    },
    comments: [
      { id: 1, name: "sarah", text: "Que bien!" },
      { id: 2, name: "mike", text: "Nice streak." },
    ],
  },
];

export default function GroupFeedCard() {
  const [posts, setPosts] = useState(initialPosts);
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});

  const toggleReaction = (postId: number, emoji: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const reaction = post.reactions[emoji];
        return {
          ...post,
          reactions: {
            ...post.reactions,
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

  const addReaction = (postId: number) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const nextEmoji = emojiPool.find((e) => !post.reactions[e]);
        if (!nextEmoji) return post;
        return {
          ...post,
          reactions: {
            ...post.reactions,
            [nextEmoji]: { count: 1, reacted: true },
          },
        };
      })
    );
  };

  const addComment = (id: number) => {
    const text = (commentDrafts[id] ?? "").trim();
    if (!text) return;

    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? {
              ...post,
              comments: [
                ...post.comments,
                { id: Date.now(), name: "you", text },
              ],
            }
          : post
      )
    );
    setCommentDrafts((prev) => ({ ...prev, [id]: "" }));
  };

  return (
    <div className="w-full flex-1 rounded-2xl border-1 border-border bg-surface p-6">
      <h2 className="text-left font-poppins text-xl font-bold text-primary">
        Group Feed
      </h2>
      <div className="feed-scroll mt-4 flex h-96 flex-col gap-4 pr-1">
        {posts.map((post) => (
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
            <p className="mt-3 font-nunito text-sm text-primary">
              <span className="font-bold">{post.name}</span> {post.content}
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
                    <span className="font-bold text-primary">{comment.name}</span>
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
        ))}
      </div>
    </div>
  );
}
