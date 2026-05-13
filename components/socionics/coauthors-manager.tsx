"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc/react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Kind = "interpretation" | "publication";

type Props = {
  kind: Kind;
  id: string;
  isOwner: boolean;
  lang: Locale;
  dict: Dictionary;
};

export function CoauthorsManager({
  kind,
  id,
  isOwner,
  lang,
  dict,
}: Props) {
  const interpretationQuery = trpc.interpretation.coauthors.useQuery(
    { id },
    { enabled: kind === "interpretation", staleTime: 30_000 },
  );
  const publicationQuery = trpc.publication.coauthors.useQuery(
    { id },
    { enabled: kind === "publication", staleTime: 30_000 },
  );
  const query =
    kind === "interpretation" ? interpretationQuery : publicationQuery;

  const utils = trpc.useUtils();
  const addInterpretation = trpc.interpretation.addCoauthor.useMutation();
  const addPublication = trpc.publication.addCoauthor.useMutation();
  const removeInterpretation = trpc.interpretation.removeCoauthor.useMutation();
  const removePublication = trpc.publication.removeCoauthor.useMutation();

  const isAdding =
    kind === "interpretation"
      ? addInterpretation.isPending
      : addPublication.isPending;
  const isRemoving =
    kind === "interpretation"
      ? removeInterpretation.isPending
      : removePublication.isPending;

  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function invalidate() {
    if (kind === "interpretation") {
      await utils.interpretation.coauthors.invalidate({ id });
    } else {
      await utils.publication.coauthors.invalidate({ id });
    }
  }

  async function onAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const u = username.trim().replace(/^@/, "");
    if (!u) return;
    try {
      if (kind === "interpretation") {
        await addInterpretation.mutateAsync({ id, username: u });
      } else {
        await addPublication.mutateAsync({ id, username: u });
      }
      setUsername("");
      await invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  async function onRemove(userId: string) {
    setError(null);
    try {
      if (kind === "interpretation") {
        await removeInterpretation.mutateAsync({ id, userId });
      } else {
        await removePublication.mutateAsync({ id, userId });
      }
      await invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  const list = query.data ?? [];

  if (list.length === 0 && !isOwner) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
        {dict.coauthors.title}
      </h3>
      {list.length === 0 ? (
        <p className="text-xs text-muted-foreground">{dict.coauthors.empty}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {list.map((u) => (
            <span
              key={u.id}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs"
            >
              <Link
                href={`/${lang}/u/${u.username}`}
                className="hover:underline underline-offset-2"
              >
                @{u.username}
              </Link>
              {isOwner && (
                <button
                  type="button"
                  onClick={() => onRemove(u.id)}
                  disabled={isRemoving}
                  className="text-muted-foreground hover:text-rose-600 transition-colors disabled:opacity-50"
                  title={dict.coauthors.remove}
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      )}
      {isOwner && (
        <form onSubmit={onAdd} className="flex items-center gap-2">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={dict.coauthors.addPlaceholder}
            maxLength={64}
            className="h-8 text-xs max-w-[180px]"
          />
          <button
            type="submit"
            disabled={isAdding || username.trim().length === 0}
            className="text-xs rounded-md border border-border px-2 py-1 hover:bg-muted disabled:opacity-50"
          >
            {isAdding ? "…" : dict.coauthors.add}
          </button>
        </form>
      )}
      {error && (
        <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
      )}
    </div>
  );
}
