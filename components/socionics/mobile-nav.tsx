"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  lang: Locale;
  dict: Dictionary;
  isAuthed: boolean;
};

export function MobileNav({ lang, dict, isAuthed }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // ESC closes.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const primary: Array<{ href: string; label: string }> = [
    { href: `/${lang}/search`, label: dict.search.title },
    { href: `/${lang}/entities`, label: dict.nav.entities },
    { href: `/${lang}/theories`, label: dict.nav.theories },
    { href: `/${lang}/schools`, label: dict.schools.title },
    { href: `/${lang}/questions`, label: dict.questions.title },
    { href: `/${lang}/events`, label: dict.events.title },
    { href: `/${lang}/polls`, label: dict.polls.title },
    { href: `/${lang}/groups`, label: dict.groups.title },
  ];

  const secondary: Array<{ href: string; label: string }> = [
    { href: `/${lang}/leaderboard`, label: dict.leaderboard.title },
    { href: `/${lang}/mentors`, label: dict.mentor.pageTitle },
    { href: `/${lang}/stats`, label: dict.stats.title },
    { href: `/${lang}/docs/api`, label: dict.apiDocs.title },
  ];

  const sessionLinks: Array<{ href: string; label: string }> = isAuthed
    ? [
        { href: `/${lang}/messages`, label: dict.dm.title },
        { href: `/${lang}/notifications`, label: dict.notifications.title },
        { href: `/${lang}/bookmarks`, label: dict.bookmarks.title },
        { href: `/${lang}/collections`, label: dict.collections.title },
        { href: `/${lang}/settings/api-keys`, label: dict.apiKeys.title },
      ]
    : [
        { href: `/${lang}/login`, label: dict.nav.login },
        { href: `/${lang}/register`, label: dict.nav.register },
      ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle navigation"
        aria-expanded={open}
        className="md:hidden inline-flex items-center justify-center size-9 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
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
          {open ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <div
          className="md:hidden fixed inset-x-0 top-[var(--header-h,3.5rem)] bottom-0 z-40 bg-background border-t border-border overflow-y-auto"
          style={{ top: "calc(env(safe-area-inset-top, 0px) + 3.5rem)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <nav className="px-6 py-4 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-mono pt-2 pb-1">
              Navigation
            </p>
            {primary.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}

            <div className="border-t border-border my-3" />

            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-mono pt-1 pb-1">
              More
            </p>
            {secondary.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}

            <div className="border-t border-border my-3" />

            {sessionLinks.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </nav>
        </div>
      )}
    </>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
    >
      {label}
    </Link>
  );
}
