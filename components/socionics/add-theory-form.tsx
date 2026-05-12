"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc/react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { slugify } from "@/lib/slug";

type Props = {
  lang: Locale;
  dict: Dictionary;
};

export function AddTheoryForm({ lang, dict }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [parentSlug, setParentSlug] = useState("");
  const [copyObjects, setCopyObjects] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = trpc.theory.create.useMutation();
  const parents = trpc.theory.list.useQuery(
    { language: lang },
    { enabled: open },
  );

  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      const r = await create.mutateAsync({
        name,
        slug,
        description,
        language: lang,
        parentTheorySlug: parentSlug || undefined,
        copyObjects,
      });
      router.push(`/${lang}/theories/${r.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} size="sm">
        + {dict.addTheory.button}
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="theory-name">{dict.addTheory.name}</Label>
            <Input
              id="theory-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder={dict.addTheory.namePlaceholder}
              maxLength={200}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="theory-slug">{dict.addTheory.slug}</Label>
            <Input
              id="theory-slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              maxLength={200}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="theory-desc">{dict.addTheory.description}</Label>
            <Textarea
              id="theory-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              minLength={20}
              maxLength={3000}
              required
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/3000
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="theory-parent">{dict.addTheory.parent}</Label>
            <select
              id="theory-parent"
              value={parentSlug}
              onChange={(e) => setParentSlug(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            >
              <option value="">— {dict.addTheory.noParent} —</option>
              {(parents.data ?? []).map((t) => (
                <option key={t.id} value={t.slug}>
                  {t.name}
                  {t.isSeed ? " (сид)" : ""}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              {dict.addTheory.parentHint}
            </p>
          </div>

          {parentSlug && (
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={copyObjects}
                onChange={(e) => setCopyObjects(e.target.checked)}
                className="mt-1"
              />
              <span>{dict.addTheory.copyObjects}</span>
            </label>
          )}

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
              disabled={create.isPending || !name || !slug || !description}
            >
              {create.isPending ? "..." : dict.addTheory.create}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
