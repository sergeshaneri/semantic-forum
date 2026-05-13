"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/react";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Status = "going" | "maybe" | "interested";

type Props = {
  eventId: string;
  initial: Status | null;
  isAuthed: boolean;
  loginHref: string;
  dict: Dictionary;
};

export function RsvpButton({
  eventId,
  initial,
  isAuthed,
  loginHref,
  dict,
}: Props) {
  const router = useRouter();
  const rsvp = trpc.event.rsvp.useMutation();
  const [status, setStatus] = useState<Status | null>(initial);

  if (!isAuthed) {
    return (
      <Button size="sm" onClick={() => router.push(loginHref)}>
        {dict.events.rsvpLogin}
      </Button>
    );
  }

  async function update(next: Status | null) {
    const prev = status;
    setStatus(next);
    try {
      await rsvp.mutateAsync({ eventId, status: next });
      router.refresh();
    } catch {
      setStatus(prev);
    }
  }

  const opts: Status[] = ["going", "maybe", "interested"];

  return (
    <div className="flex gap-2 flex-wrap">
      {opts.map((s) => (
        <button
          type="button"
          key={s}
          onClick={() => update(status === s ? null : s)}
          disabled={rsvp.isPending}
          className={cn(
            "rounded-md border px-3 py-1.5 text-sm transition-colors",
            status === s
              ? "border-foreground bg-foreground text-background"
              : "border-border hover:bg-muted",
          )}
        >
          {dict.events.rsvp[s]}
        </button>
      ))}
    </div>
  );
}
