"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/lib/trpc/react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  username: string;
  isAuthed: boolean;
  loginHref: string;
  lang: Locale;
  dict: Dictionary;
};

export function StartDmButton({
  username,
  isAuthed,
  loginHref,
  lang,
  dict,
}: Props) {
  const router = useRouter();
  const start = trpc.dm.start.useMutation();
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    if (!isAuthed) {
      router.push(loginHref);
      return;
    }
    setError(null);
    try {
      const r = await start.mutateAsync({ username });
      router.push(`/${lang}/messages/${r.conversationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        disabled={start.isPending}
        className="text-sm rounded-md border border-border px-3 py-1.5 hover:bg-muted transition-colors disabled:opacity-50"
      >
        {start.isPending ? "…" : dict.dm.sendToProfile}
      </button>
      {error && (
        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
          {error}
        </p>
      )}
    </>
  );
}
