"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/react";

type Props = {
  targetType: "interpretation" | "comment" | "answer" | "group_post";
  targetId: string;
  score: number;
  votesUp: number;
  votesDown: number;
  userVote: 1 | -1 | 0;
  isAuthed: boolean;
  loginHref: string;
  size?: "default" | "sm";
  vertical?: boolean;
  className?: string;
};

export function VoteWidget({
  targetType,
  targetId,
  score: initialScore,
  votesUp: initialUp,
  votesDown: initialDown,
  userVote: initialUserVote,
  isAuthed,
  loginHref,
  size = "default",
  vertical = true,
  className,
}: Props) {
  const router = useRouter();
  const cast = trpc.vote.cast.useMutation();
  const [, startTransition] = useTransition();

  const [score, setScore] = useState(initialScore);
  const [up, setUp] = useState(initialUp);
  const [down, setDown] = useState(initialDown);
  const [userVote, setUserVote] = useState<1 | -1 | 0>(initialUserVote);

  const isSmall = size === "sm";
  const arrowSize = isSmall ? "size-3" : "size-4";
  const numberSize = isSmall ? "text-sm" : "text-base";

  async function handleVote(value: 1 | -1) {
    if (!isAuthed) {
      router.push(loginHref);
      return;
    }

    const prev = { score, up, down, userVote };

    let nextUp = up;
    let nextDown = down;
    let nextUserVote: 1 | -1 | 0;
    if (userVote === value) {
      if (value === 1) nextUp = up - 1;
      else nextDown = down - 1;
      nextUserVote = 0;
    } else if (userVote === -value) {
      if (value === 1) {
        nextUp = up + 1;
        nextDown = down - 1;
      } else {
        nextUp = up - 1;
        nextDown = down + 1;
      }
      nextUserVote = value;
    } else {
      if (value === 1) nextUp = up + 1;
      else nextDown = down + 1;
      nextUserVote = value;
    }

    setUp(nextUp);
    setDown(nextDown);
    setScore(nextUp - nextDown);
    setUserVote(nextUserVote);

    try {
      const result = await cast.mutateAsync({
        targetType,
        targetId,
        value,
      });
      setUp(result.votesUp);
      setDown(result.votesDown);
      setScore(result.score);
      setUserVote(result.userVote as 1 | -1 | 0);
      startTransition(() => router.refresh());
    } catch {
      setScore(prev.score);
      setUp(prev.up);
      setDown(prev.down);
      setUserVote(prev.userVote);
    }
  }

  return (
    <div
      className={cn(
        "flex items-center select-none text-muted-foreground",
        vertical ? "flex-col gap-0.5" : "flex-row gap-2",
        className,
      )}
    >
      <button
        type="button"
        title={`${up}`}
        onClick={() => handleVote(1)}
        disabled={cast.isPending}
        className={cn(
          "rounded p-1 hover:bg-muted transition-colors disabled:opacity-50",
          userVote === 1 ? "text-emerald-600" : "hover:text-emerald-600",
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={userVote === 1 ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={arrowSize}
        >
          <path d="M12 19V5" />
          <path d="m5 12 7-7 7 7" />
        </svg>
      </button>
      <span
        className={cn(
          "font-semibold tabular-nums",
          numberSize,
          userVote !== 0 ? "text-foreground" : "text-foreground",
        )}
      >
        {score >= 0 ? `+${score}` : score}
      </span>
      <button
        type="button"
        title={`${down}`}
        onClick={() => handleVote(-1)}
        disabled={cast.isPending}
        className={cn(
          "rounded p-1 hover:bg-muted transition-colors disabled:opacity-50",
          userVote === -1 ? "text-rose-600" : "hover:text-rose-600",
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={userVote === -1 ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={arrowSize}
        >
          <path d="M12 5v14" />
          <path d="m19 12-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}
