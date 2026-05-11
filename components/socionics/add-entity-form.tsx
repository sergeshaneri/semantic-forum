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

export function AddEntityForm({ lang, dict }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"word" | "person">("word");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const create = trpc.entity.create.useMutation();

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      const result = await create.mutateAsync({
        kind,
        title,
        slug,
        descriptionWiki: description,
        language: lang,
      });
      router.push(`/${lang}/entities/${result.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  if (!open) {
    return (
      <Button variant="default" size="sm" onClick={() => setOpen(true)}>
        + {dict.addEntity.button}
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>{dict.addEntity.kind}</Label>
            <div className="flex gap-2">
              {(["word", "person"] as const).map((k) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => setKind(k)}
                  className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                    kind === k
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {k === "word"
                    ? dict.entities.kindWord
                    : dict.entities.kindPerson}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">{dict.addEntity.title}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder={
                kind === "word"
                  ? dict.addEntity.titleWordPlaceholder
                  : dict.addEntity.titlePersonPlaceholder
              }
              maxLength={300}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug">{dict.addEntity.slug}</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder="immanuel-kant"
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              maxLength={80}
              required
            />
            <p className="text-xs text-muted-foreground">
              {dict.addEntity.slugHint}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">{dict.addEntity.description}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={dict.addEntity.descriptionPlaceholder}
              rows={5}
              minLength={20}
              maxLength={3000}
              required
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/3000 · {dict.addEntity.descriptionHint}
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
              disabled={create.isPending || !title || !slug || !description}
            >
              {create.isPending ? "..." : dict.addEntity.create}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
