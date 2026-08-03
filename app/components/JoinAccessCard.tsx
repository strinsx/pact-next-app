"use client";

import { Copy, Link2, LinkIcon, Clock3 } from "lucide-react";
import { useState } from "react";

const mockInviteCode = "4F7K2Q9X";

export default function JoinAccessCard() {
  const [joinLink, setJoinLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setJoinLink(
      `${window.location.origin}/groups/join?code=${mockInviteCode}`
    );
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!joinLink) return;
    await navigator.clipboard.writeText(joinLink);
    setCopied(true);
  };

  return (
    <div className="w-full">
      <h2 className="self-start font-poppins text-xl font-bold text-primary">
        Join Access
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex min-h-50 items-center justify-center rounded-2xl border-1 border-border bg-surface p-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-purple" />
              <span className="font-nunito text-sm font-bold text-primary">
                Pending Requests
              </span>
            </div>
            <p className="text-center font-nunito text-sm text-muted">
              no pending requests right now
            </p>
          </div>
        </div>
        <div className="rounded-2xl border-1 border-border bg-surface p-6">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-secondary" />
            <span className="font-nunito text-sm font-bold text-primary">
              Invite Link
            </span>
          </div>
          <div className="mt-3 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border-1 border-border bg-white px-4 py-2 font-nunito text-sm font-bold text-primary shadow-sm transition-colors hover:bg-border/50"
            >
              <LinkIcon className="h-4 w-4" />
              Generate join link
            </button>
            {joinLink && (
              <div className="flex items-center gap-2 rounded-xl border-1 border-border bg-background px-3 py-2">
                <span className="flex-1 truncate font-nunito text-xs text-muted">
                  {joinLink}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 py-1 font-nunito text-xs font-bold text-secondary transition-colors hover:bg-secondary/10"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
