"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc/react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Step = {
  title: string;
  body: string;
  link?: { href: string; label: string };
  emoji: string;
};

type Props = {
  lang: Locale;
  dict: Dictionary;
  username: string;
  /** When set externally (e.g. from "Replay" button), forces the tour open. */
  forceOpen?: boolean;
  onClose?: () => void;
};

export function OnboardingTour({
  lang,
  dict,
  username,
  forceOpen,
  onClose,
}: Props) {
  const status = trpc.user.onboardingStatus.useQuery(undefined, {
    staleTime: 60_000,
  });
  const dismiss = trpc.user.dismissOnboarding.useMutation();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      setStep(0);
      return;
    }
    if (status.data && !status.data.dismissed) {
      setOpen(true);
      setStep(0);
    }
  }, [status.data, forceOpen]);

  // External replay trigger (from <OnboardingLauncher>)
  useEffect(() => {
    function handler() {
      setOpen(true);
      setStep(0);
    }
    window.addEventListener("ssf:replay-tour", handler);
    return () => window.removeEventListener("ssf:replay-tour", handler);
  }, []);

  const steps: Step[] = [
    {
      emoji: "👋",
      title: dict.onboarding.welcomeTitle,
      body: dict.onboarding.welcomeBody,
    },
    {
      emoji: "📚",
      title: dict.onboarding.contentTitle,
      body: dict.onboarding.contentBody,
      link: {
        href: `/${lang}/entities`,
        label: dict.onboarding.contentLinkLabel,
      },
    },
    {
      emoji: "💬",
      title: dict.onboarding.interpretationsTitle,
      body: dict.onboarding.interpretationsBody,
    },
    {
      emoji: "🫂",
      title: dict.onboarding.socialTitle,
      body: dict.onboarding.socialBody,
      link: {
        href: `/${lang}/groups`,
        label: dict.onboarding.socialLinkLabel,
      },
    },
    {
      emoji: "✍️",
      title: dict.onboarding.authorTitle,
      body: dict.onboarding.authorBody,
    },
    {
      emoji: "🎓",
      title: dict.onboarding.qaTitle,
      body: dict.onboarding.qaBody,
    },
    {
      emoji: "🤖",
      title: dict.onboarding.advancedTitle,
      body: dict.onboarding.advancedBody,
      link: {
        href: `/${lang}/docs/api`,
        label: dict.onboarding.advancedLinkLabel,
      },
    },
    {
      emoji: "🚀",
      title: dict.onboarding.finalTitle,
      body: dict.onboarding.finalBody,
      link: {
        href: `/${lang}/u/${username}`,
        label: dict.onboarding.finalCta,
      },
    },
  ];

  const total = steps.length;
  const current = steps[step];

  function close() {
    setOpen(false);
    onClose?.();
  }

  async function finish() {
    try {
      await dismiss.mutateAsync();
    } catch {
      // Non-fatal; just close the modal.
    }
    close();
  }

  function counter() {
    return dict.onboarding.counter
      .replace("{current}", String(step + 1))
      .replace("{total}", String(total));
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight" && step < total - 1) {
        setStep((s) => s + 1);
      }
      if (e.key === "ArrowLeft" && step > 0) {
        setStep((s) => s - 1);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step, total]);

  if (!open || !current) return null;

  const isFirst = step === 0;
  const isLast = step === total - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-tour-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-border bg-background shadow-2xl overflow-hidden">
        <div className="px-6 pt-6 pb-2 flex items-start justify-between gap-3">
          <span className="text-3xl leading-none select-none">
            {current.emoji}
          </span>
          <button
            type="button"
            onClick={close}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
          >
            {dict.onboarding.skip}
          </button>
        </div>

        <div className="px-6 space-y-3">
          <h2
            id="onboarding-tour-title"
            className="font-heading text-2xl font-semibold tracking-tight leading-tight"
          >
            {current.title}
          </h2>
          <p className="text-sm text-foreground/85 leading-relaxed">
            {current.body}
          </p>
          {current.link && (
            <Link
              href={current.link.href}
              onClick={() => finish()}
              className="inline-block text-sm rounded-md border border-border px-3 py-1.5 hover:bg-muted transition-colors"
            >
              {current.link.label}
            </Link>
          )}
        </div>

        <div className="px-6 py-2 mt-4">
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  idx === step
                    ? "bg-foreground"
                    : idx < step
                      ? "bg-foreground/40"
                      : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground font-mono">
            {counter()}
          </span>
          <div className="flex gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="text-sm rounded-md border border-border px-3 py-1.5 hover:bg-muted transition-colors"
              >
                {dict.onboarding.back}
              </button>
            )}
            {!isLast ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
                className="text-sm rounded-md bg-foreground text-background px-3 py-1.5 hover:opacity-90"
              >
                {dict.onboarding.next}
              </button>
            ) : (
              <button
                type="button"
                onClick={finish}
                disabled={dismiss.isPending}
                className="text-sm rounded-md bg-foreground text-background px-3 py-1.5 hover:opacity-90 disabled:opacity-50"
              >
                {dismiss.isPending ? "…" : dict.onboarding.finish}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
