import { cn } from "@/lib/utils";

export type Stance = "pro" | "contra" | "neutral";

const styles: Record<Stance, string> = {
  pro: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  contra: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
  neutral: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30",
};

const dots: Record<Stance, string> = {
  pro: "bg-emerald-500",
  contra: "bg-rose-500",
  neutral: "bg-sky-500",
};

export function StanceBadge({
  stance,
  label,
  className,
}: {
  stance: Stance;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[stance],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", dots[stance])} />
      {label}
    </span>
  );
}
