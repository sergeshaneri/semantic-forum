"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc/react";
import { slugify } from "@/lib/slug";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  lang: Locale;
  dict: Dictionary;
};

export function AskQuestionButton({ lang, dict }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const create = trpc.question.create.useMutation();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      const r = await create.mutateAsync({
        title,
        slug,
        body,
        language: lang,
      });
      router.push(`/${lang}/questions/${r.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        + {dict.questions.askButton}
      </Button>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-5">
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label>{dict.questions.formTitle}</Label>
            <Input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder={dict.questions.titlePlaceholder}
              maxLength={300}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Slug</Label>
            <Input
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
            <Label>{dict.questions.formBody}</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              minLength={20}
              maxLength={10000}
              placeholder={dict.questions.bodyPlaceholder}
              required
            />
            <p className="text-xs text-muted-foreground">
              {dict.questions.bodyHint}
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
              disabled={create.isPending || !title || !slug || !body}
            >
              {create.isPending ? "..." : dict.questions.askButton}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
