"use client";

import Link from "next/link";
import { useState } from "react";
import { trpc } from "@/lib/trpc/react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type StepKey =
  | "profileFilled"
  | "interpretationPublished"
  | "commented"
  | "voted"
  | "followed"
  | "authored";

type Props = {
  lang: Locale;
  dict: Dictionary;
  username: string;
};

export function ProgressChecklist({ lang, dict, username }: Props) {
  const progress = trpc.user.checklistProgress.useQuery(undefined, {
    staleTime: 60_000,
  });
  const dismiss = trpc.user.dismissChecklist.useMutation();
  const utils = trpc.useUtils();
  const [collapsed, setCollapsed] = useState(false);

  if (!progress.data) return null;
  if (progress.data.dismissed) return null;

  const steps = progress.data.steps;
  const stepOrder: StepKey[] = [
    "profileFilled",
    "interpretationPublished",
    "commented",
    "voted",
    "followed",
    "authored",
  ];
  const ctaHref: Record<StepKey, string> = {
    profileFilled: `/${lang}/u/${username}`,
    interpretationPublished: `/${lang}/entities`,
    commented: `/${lang}/entities`,
    voted: `/${lang}`,
    followed: `/${lang}/leaderboard`,
    authored: `/${lang}/u/${username}`,
  };

  const doneCount = stepOrder.filter((k) => steps[k]).length;
  const total = stepOrder.length;
  const allDone = doneCount === total;
  const progressText = dict.checklist.progressFmt
    .replace("{done}", String(doneCount))
    .replace("{total}", String(total));

  async function onDismiss() {
    try {
      await dismiss.mutateAsync();
      await utils.user.checklistProgress.invalidate();
    } catch {
      // non-fatal
    }
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-40 w-[20rem] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-background shadow-lg overflow-hidden"
      role="region"
      aria-label={dict.checklist.title}
    >
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/50 transition-colors text-left"
      >
        <span className="text-base">{allDone ? "🎉" : "🧭"}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{dict.checklist.title}</p>
          <p className="text-[11px] text-muted-foreground font-mono">
            {progressText}
          </p>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`size-4 text-muted-foreground transition-transform ${
            collapsed ? "" : "rotate-180"
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {!collapsed && (
        <>
          <div className="px-3 pb-2 border-t border-border/60">
            <div className="h-1 mt-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-foreground transition-all"
                style={{
                  width: `${total === 0 ? 0 : (doneCount / total) * 100}%`,
                }}
              />
            </div>
          </div>

          <ul className="px-3 pb-2 space-y-1.5">
            {allDone && (
              <li className="px-1 py-2 text-xs text-muted-foreground italic">
                {dict.checklist.done}
              </li>
            )}
            {!allDone && (
              <li className="px-1 pt-1 pb-2 text-xs text-muted-foreground">
                {dict.checklist.subtitle}
              </li>
            )}
            {stepOrder.map((key) => {
              const done = steps[key];
              const stepDict = dict.checklist.steps[key];
              return (
                <li key={key} className="flex items-start gap-2 text-sm">
                  <span
                    aria-hidden
                    className={`mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      done
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-border"
                    }`}
                  >
                    {done && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`leading-snug ${
                        done ? "text-muted-foreground line-through" : ""
                      }`}
                    >
                      {stepDict.label}
                    </p>
                    {!done && (
                      <Link
                        href={ctaHref[key]}
                        className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 decoration-dotted"
                      >
                        {stepDict.cta} →
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="px-3 py-2 border-t border-border/60 flex justify-end">
            <button
              type="button"
              onClick={onDismiss}
              disabled={dismiss.isPending}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              {dict.checklist.hide}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
