"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc/react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  lang: Locale;
  dict: Dictionary;
};

function getSymbol(metadata: Record<string, unknown> | null | undefined) {
  if (metadata && typeof metadata === "object" && "symbol" in metadata) {
    const v = (metadata as { symbol?: unknown }).symbol;
    return typeof v === "string" ? v : null;
  }
  return null;
}

export function FollowFeed({ lang, dict }: Props) {
  const feed = trpc.user.feed.useQuery();

  if (feed.isLoading) return null;
  const items = feed.data ?? [];
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="font-heading text-2xl font-semibold tracking-tight">
        {dict.feed.title}
      </h2>
      <p className="text-sm text-muted-foreground">
        {dict.feed.subtitle}
      </p>
      <ul className="space-y-3">
        {items.map((i) => {
          const symbol = getSymbol(i.theoryObject?.metadata);
          return (
            <li key={i.id}>
              <Card>
                <CardContent className="py-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                    {i.author && (
                      <Link
                        href={`/${lang}/u/${i.author.username}`}
                        className="text-foreground font-medium hover:underline"
                      >
                        @{i.author.username}
                      </Link>
                    )}
                    <span>·</span>
                    <span className="font-mono">+{i.score}</span>
                    {i.entity && (
                      <>
                        <span>·</span>
                        <Link
                          href={`/${lang}/entities/${i.entity.slug}`}
                          className="text-foreground hover:underline"
                        >
                          {i.entity.title}
                        </Link>
                      </>
                    )}
                    {i.theoryObject && (
                      <>
                        <span>·</span>
                        <span className="font-mono inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-foreground/5">
                          {symbol && <span className="font-semibold">{symbol}</span>}
                          <span>{i.theoryObject.name}</span>
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-foreground/90 line-clamp-3 leading-relaxed">
                    {i.body}
                  </p>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
