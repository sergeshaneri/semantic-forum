"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";

type Props = {
  dict: Dictionary;
};

/**
 * Footer link that re-opens the onboarding tour. The actual modal is
 * mounted once at the layout level; we trigger it via a window event
 * so we don't fight the auto-show state.
 */
export function OnboardingLauncher({ dict }: Props) {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("ssf:replay-tour"));
        }
      }}
      className="hover:text-foreground transition-colors text-left"
    >
      {dict.onboarding.replay}
    </button>
  );
}
