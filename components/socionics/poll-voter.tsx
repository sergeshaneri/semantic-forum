"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Props = {
  pollId: string;
  options: string[];
  tallies: number[];
  totalVotes: number;
  myVote: number | null;
  isClosed: boolean;
  isAuthed: boolean;
  loginHref: string;
  dict: Dictionary;
};

export function PollVoter({
  pollId,
  options,
  tallies,
  totalVotes,
  myVote: initialMyVote,
  isClosed,
  isAuthed,
  loginHref,
  dict,
}: Props) {
  const router = useRouter();
  const cast = trpc.poll.vote.useMutation();

  const [myVote, setMyVote] = useState<number | null>(initialMyVote);
  const [localTallies, setLocalTallies] = useState<number[]>(tallies);
  const [localTotal, setLocalTotal] = useState<number>(totalVotes);

  async function onPick(idx: number) {
    if (isClosed) return;
    if (!isAuthed) {
      router.push(loginHref);
      return;
    }
    const prev = { myVote, tallies: localTallies, total: localTotal };
    // Optimistic update
    const nextTallies = [...localTallies];
    let nextTotal = localTotal;
    if (myVote === null) {
      nextTallies[idx] = (nextTallies[idx] ?? 0) + 1;
      nextTotal++;
    } else if (myVote !== idx) {
      nextTallies[myVote] = Math.max(0, (nextTallies[myVote] ?? 0) - 1);
      nextTallies[idx] = (nextTallies[idx] ?? 0) + 1;
    } else {
      return; // same vote
    }
    setMyVote(idx);
    setLocalTallies(nextTallies);
    setLocalTotal(nextTotal);
    try {
      await cast.mutateAsync({ pollId, optionIndex: idx });
      router.refresh();
    } catch {
      setMyVote(prev.myVote);
      setLocalTallies(prev.tallies);
      setLocalTotal(prev.total);
    }
  }

  return (
    <div className="space-y-2">
      <ul className="space-y-2">
        {options.map((opt, idx) => {
          const count = localTallies[idx] ?? 0;
          const pct = localTotal > 0 ? Math.round((count / localTotal) * 100) : 0;
          const picked = myVote === idx;
          return (
            <li key={idx}>
              <button
                type="button"
                onClick={() => onPick(idx)}
                disabled={cast.isPending || isClosed}
                className={cn(
                  "w-full text-left rounded-md border transition-colors relative overflow-hidden disabled:opacity-80",
                  picked
                    ? "border-foreground bg-muted"
                    : "border-border hover:bg-muted/50",
                )}
              >
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 transition-all",
                    picked ? "bg-foreground/15" : "bg-foreground/5",
                  )}
                  style={{ width: `${pct}%` }}
                  aria-hidden
                />
                <span className="relative flex items-center justify-between gap-2 px-3 py-2 text-sm">
                  <span className="font-medium">{opt}</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {pct}% · {count}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted-foreground">
        {localTotal} {dict.polls.voteCount}
        {isClosed && ` · ${dict.polls.closed}`}
        {!isClosed && myVote !== null && ` · ${dict.polls.voted}`}
        {!isClosed && ` · ${dict.polls.voteHint}`}
      </p>
    </div>
  );
}
