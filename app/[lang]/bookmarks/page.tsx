"use client";

import Link from "next/link";
import { use } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc/react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

export default function BookmarksPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const dict = getDictionary(lang as Locale);
  const list = trpc.bookmark.myList.useQuery();
  const items = list.data ?? [];

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-6">
      <header>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {dict.bookmarks.title}
        </h1>
      </header>

      {list.isLoading ? (
        <p className="text-sm text-muted-foreground">…</p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {dict.bookmarks.empty}
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {items.map((b) => (
            <li key={`${b.targetType}-${b.targetId}`}>
              <Link
                href={b.href}
                className="block rounded-md border border-border px-3 py-2.5 hover:bg-muted/50 transition-colors space-y-1"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs font-normal">
                    {dict.bookmarks.types[b.targetType]}
                  </Badge>
                  {b.subtitle && (
                    <span className="text-xs text-muted-foreground">
                      {b.subtitle}
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground">{b.title}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
