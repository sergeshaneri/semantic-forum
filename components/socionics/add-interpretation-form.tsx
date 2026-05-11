"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc/react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  entityId: string;
  lang: Locale;
  dict: Dictionary;
};

export function AddInterpretationForm({ entityId, lang, dict }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [theoryId, setTheoryId] = useState("");
  const [theoryObjectId, setTheoryObjectId] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const theoriesQuery = trpc.theory.list.useQuery(
    { language: lang },
    { enabled: open },
  );
  const objectsQuery = trpc.theory.getObjects.useQuery(
    { theoryId },
    { enabled: open && theoryId.length > 0 },
  );
  const create = trpc.interpretation.create.useMutation();

  const objects = useMemo(() => {
    const list = objectsQuery.data ?? [];
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [objectsQuery.data]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!theoryId || !theoryObjectId) {
      setError(dict.addInterpretation.selectBoth);
      return;
    }
    try {
      await create.mutateAsync({
        entityId,
        theoryId,
        theoryObjectId,
        body,
      });
      setBody("");
      setTheoryId("");
      setTheoryObjectId("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  if (!open) {
    return (
      <Button variant="default" size="sm" onClick={() => setOpen(true)}>
        + {dict.interpretation.addInterpretation}
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="theory">{dict.addInterpretation.theory}</Label>
            <select
              id="theory"
              value={theoryId}
              onChange={(e) => {
                setTheoryId(e.target.value);
                setTheoryObjectId("");
              }}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            >
              <option value="">— {dict.addInterpretation.selectTheory} —</option>
              {(theoriesQuery.data ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                  {t.isSeed ? " (сид)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="object">{dict.addInterpretation.theoryObject}</Label>
            <select
              id="object"
              value={theoryObjectId}
              onChange={(e) => setTheoryObjectId(e.target.value)}
              disabled={!theoryId || objectsQuery.isLoading}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
              required
            >
              <option value="">
                — {dict.addInterpretation.selectObject} —
              </option>
              {objects.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="body">{dict.addInterpretation.body}</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={dict.addInterpretation.bodyPlaceholder}
              rows={6}
              minLength={20}
              maxLength={5000}
              required
            />
            <p className="text-xs text-muted-foreground">
              {body.length}/5000 · {dict.addInterpretation.bodyHint}
            </p>
          </div>

          {error && (
            <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setOpen(false);
                setError(null);
              }}
              disabled={create.isPending}
            >
              {dict.addInterpretation.cancel}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={create.isPending || !theoryId || !theoryObjectId}
            >
              {create.isPending ? "..." : dict.addInterpretation.publish}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
