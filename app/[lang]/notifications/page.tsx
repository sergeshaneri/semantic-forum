"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc/react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

export default function NotificationsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const dict = getDictionary(lang as Locale);
  const router = useRouter();
  const list = trpc.notification.list.useQuery({
    unreadOnly: false,
    limit: 100,
  });
  const markAll = trpc.notification.markAllRead.useMutation({
    onSuccess: () => {
      list.refetch();
      router.refresh();
    },
  });

  const items = list.data ?? [];

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 space-y-6">
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {dict.notifications.title}
        </h1>
        {items.some((n) => !n.readAt) && (
          <button
            type="button"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            {dict.notifications.markAllRead}
          </button>
        )}
      </header>

      {list.isLoading ? (
        <p className="text-sm text-muted-foreground">…</p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {dict.notifications.empty}
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li key={n.id}>
              <Link
                href={n.url ?? "#"}
                className={cn(
                  "block rounded-md border border-border px-3 py-2.5 hover:bg-muted/50 transition-colors",
                  !n.readAt && "bg-muted/40",
                )}
              >
                <p className="text-sm">
                  {n.actor && (
                    <span className="font-medium">@{n.actor.username} </span>
                  )}
                  <span className="text-foreground/80">{n.message}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(n.createdAt).toLocaleString(
                    lang === "ru" ? "ru-RU" : "en-US",
                    {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
