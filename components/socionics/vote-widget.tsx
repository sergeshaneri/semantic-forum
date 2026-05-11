import { cn } from "@/lib/utils";

export function VoteWidget({
  score,
  votesUp,
  votesDown,
  size = "default",
  vertical = true,
  className,
}: {
  score: number;
  votesUp: number;
  votesDown: number;
  size?: "default" | "sm";
  vertical?: boolean;
  className?: string;
}) {
  const isSmall = size === "sm";
  const arrow = isSmall ? "size-3" : "size-4";
  const number = isSmall ? "text-sm" : "text-base";

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
        title={`${votesUp}`}
        className="rounded p-1 hover:bg-muted hover:text-emerald-600 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={arrow}
        >
          <path d="M12 19V5" />
          <path d="m5 12 7-7 7 7" />
        </svg>
      </button>
      <span className={cn("font-semibold tabular-nums text-foreground", number)}>
        {score >= 0 ? `+${score}` : score}
      </span>
      <button
        type="button"
        title={`${votesDown}`}
        className="rounded p-1 hover:bg-muted hover:text-rose-600 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={arrow}
        >
          <path d="M12 5v14" />
          <path d="m19 12-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}
