"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  lang: Locale;
  dict: Dictionary;
  user: {
    username?: string | null;
    name?: string | null;
    image?: string | null;
  };
};

export function UserMenu({ lang, dict, user }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  async function handleSignOut() {
    setOpen(false);
    await signOut({ redirect: false });
    router.push(`/${lang}`);
    router.refresh();
  }

  const label = user.username ?? user.name ?? "user";
  const initial = (label[0] ?? "u").toUpperCase();

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border px-2 py-1 hover:bg-muted transition-colors"
      >
        <span className="size-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-semibold">
          {initial}
        </span>
        <span className="text-sm pr-1">@{label}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-md border border-border bg-card shadow-lg z-50 py-1">
          {user.username && (
            <Link
              href={`/${lang}/u/${user.username}`}
              className="block px-3 py-2 text-sm hover:bg-muted transition-colors"
              onClick={() => setOpen(false)}
            >
              {dict.nav.profile}
            </Link>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="block w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors text-rose-600 dark:text-rose-400"
          >
            {dict.auth.logout}
          </button>
        </div>
      )}
    </div>
  );
}
