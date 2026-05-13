"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/slug";
import { trpc } from "@/lib/trpc/react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  lang: Locale;
  dict: Dictionary;
};

export function AddPollForm({ lang, dict }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const create = trpc.poll.create.useMutation();

  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [closesAt, setClosesAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  function setOpt(idx: number, v: string) {
    setOptions((prev) => prev.map((o, i) => (i === idx ? v : o)));
  }
  function addOpt() {
    setOptions((prev) => (prev.length >= 20 ? prev : [...prev, ""]));
  }
  function removeOpt(idx: number) {
    setOptions((prev) => (prev.length <= 2 ? prev : prev.filter((_, i) => i !== idx)));
  }

  function onQuestionChange(v: string) {
    setQuestion(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const cleanOpts = options.map((o) => o.trim()).filter(Boolean);
    if (cleanOpts.length < 2) {
      setError("Нужно минимум 2 варианта");
      return;
    }
    try {
      const r = await create.mutateAsync({
        question,
        description: description || undefined,
        slug,
        language: lang,
        options: cleanOpts,
        closesAt: closesAt ? new Date(closesAt) : undefined,
      });
      setOpen(false);
      router.push(`/${lang}/polls/${r.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        + {dict.polls.create}
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>{dict.polls.questionLabel}</Label>
            <Input
              value={question}
              onChange={(e) => onQuestionChange(e.target.value)}
              maxLength={500}
              placeholder={dict.polls.questionPlaceholder}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>{dict.polls.descriptionLabel}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{dict.polls.slugLabel}</Label>
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
          <div className="space-y-2">
            <Label>{dict.polls.optionLabel}</Label>
            {options.map((o, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={o}
                  onChange={(e) => setOpt(idx, e.target.value)}
                  maxLength={200}
                  placeholder={`${dict.polls.optionLabel} ${idx + 1}`}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOpt(idx)}
                    className="text-xs text-muted-foreground hover:text-rose-600 transition-colors"
                  >
                    {dict.polls.removeOption}
                  </button>
                )}
              </div>
            ))}
            {options.length < 20 && (
              <button
                type="button"
                onClick={addOpt}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {dict.polls.addOption}
              </button>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>{dict.polls.closesAt}</Label>
            <Input
              type="datetime-local"
              value={closesAt}
              onChange={(e) => setClosesAt(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          )}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={create.isPending}
            >
              {dict.addInterpretation.cancel}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={create.isPending || !question || !slug}
            >
              {create.isPending ? "…" : dict.polls.publish}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
