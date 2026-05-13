"use client";

import Link from "next/link";
import { use, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc/react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

type Range = "week" | "month" | "all";

const RANGE_DAYS: Record<Range, number | undefined> = {
  week: 7,
  month: 30,
  all: undefined,
};

export default function LeaderboardPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const dict = getDictionary(lang as Locale);
  const [range, setRange] = useState<Range>("week");

  const days = RANGE_DAYS[range];
  const query = trpc.leaderboard.top.useQuery({ days, limit: 30 });
  const rows = query.data ?? [];

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-6">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {dict.leaderboard.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {dict.leaderboard.subtitle}
        </p>
      </header>

      <div className="flex gap-2 text-sm">
        {(["week", "month", "all"] as const).map((r) => (
          <button
            type="button"
            key={r}
            onClick={() => setRange(r)}
            className={cn(
              "rounded-full border px-3 py-1 transition-colors",
              range === r
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:bg-muted text-muted-foreground",
            )}
          >
            {dict.leaderboard.ranges[r]}
          </button>
        ))}
      </div>

      {query.isLoading ? (
        <p className="text-sm text-muted-foreground">…</p>
      ) : rows.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {dict.leaderboard.empty}
          </CardContent>
        </Card>
      ) : (
        <ol className="space-y-2">
          {rows.map((r, idx) => {
            const initial = (r.username[0] ?? "u").toUpperCase();
            return (
              <li key={r.userId}>
                <Link
                  href={`/${lang}/u/${r.username}`}
                  className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5 hover:bg-muted/40 transition-colors"
                >
                  <span className="text-sm font-mono tabular-nums w-6 text-muted-foreground">
                    {idx + 1}
                  </span>
                  <span className="size-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-semibold overflow-hidden">
                    {r.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.image}
                        alt={r.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      initial
                    )}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="text-sm font-medium">
                      {r.name || `@${r.username}`}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      @{r.username} · {r.interpretationCount}{" "}
                      {dict.profile.interpretations} · {r.commentCount}{" "}
                      {dict.profile.comments}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "font-mono tabular-nums text-base font-semibold",
                      r.karma >= 0
                        ? "text-emerald-600"
                        : "text-rose-600",
                    )}
                  >
                    {r.karma >= 0 ? `+${r.karma}` : r.karma}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
