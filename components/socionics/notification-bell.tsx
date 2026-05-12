"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc/react";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  lang: Locale;
  dict: Dictionary;
};

export function NotificationBell({ lang, dict }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unread = trpc.notification.unreadCount.useQuery(undefined, {
    refetchInterval: 60_000,
  });
  const list = trpc.notification.list.useQuery(
    { unreadOnly: false, limit: 10 },
    { enabled: open },
  );
  const markAll = trpc.notification.markAllRead.useMutation({
    onSuccess: () => {
      unread.refetch();
      list.refetch();
    },
  });

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", onClick);
      return () => document.removeEventListener("mousedown", onClick);
    }
  }, [open]);

  const count = unread.data ?? 0;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-md p-1.5 hover:bg-muted transition-colors"
        title={dict.notifications.title}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center size-4 rounded-full bg-rose-600 text-background text-[10px] font-semibold">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-md border border-border bg-card shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-sm font-medium">
              {dict.notifications.title}
            </span>
            {count > 0 && (
              <button
                type="button"
                onClick={() => markAll.mutate()}
                disabled={markAll.isPending}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {dict.notifications.markAllRead}
              </button>
            )}
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {list.isLoading ? (
              <div className="px-3 py-4 text-sm text-muted-foreground">
                …
              </div>
            ) : (list.data ?? []).length === 0 ? (
              <div className="px-3 py-4 text-sm text-muted-foreground">
                {dict.notifications.empty}
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {(list.data ?? []).map((n) => (
                  <li
                    key={n.id}
                    className={cn(
                      "px-3 py-2.5",
                      !n.readAt && "bg-muted/40",
                    )}
                  >
                    <Link
                      href={n.url ?? "#"}
                      onClick={() => setOpen(false)}
                      className="block hover:opacity-80 transition-opacity"
                    >
                      <div className="text-xs text-muted-foreground">
                        {n.actor && (
                          <span className="font-medium text-foreground">
                            @{n.actor.username}{" "}
                          </span>
                        )}
                        {n.message}
                      </div>
                      <div className="text-[11px] text-muted-foreground/70 mt-0.5">
                        {new Date(n.createdAt).toLocaleString(
                          lang === "ru" ? "ru-RU" : "en-US",
                          {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Link
            href={`/${lang}/notifications`}
            onClick={() => setOpen(false)}
            className="block border-t border-border px-3 py-2 text-xs text-center text-muted-foreground hover:text-foreground transition-colors"
          >
            {dict.notifications.seeAll}
          </Link>
        </div>
      )}
    </div>
  );
}
