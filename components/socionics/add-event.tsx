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

type Kind = "online" | "offline" | "hybrid";

type Props = {
  lang: Locale;
  dict: Dictionary;
};

export function AddEventButton({ lang, dict }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const create = trpc.event.create.useMutation();
  const [kind, setKind] = useState<Kind>("online");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [location, setLocation] = useState("");
  const [locationUrl, setLocationUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onTitleChange(v: string) {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      const r = await create.mutateAsync({
        title,
        slug,
        description,
        kind,
        startAt: new Date(startAt).toISOString(),
        endAt: endAt ? new Date(endAt).toISOString() : undefined,
        location: location || undefined,
        locationUrl: locationUrl || undefined,
        language: lang,
      });
      router.push(`/${lang}/events/${r.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        + {dict.events.addButton}
      </Button>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-5">
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {(["online", "offline", "hybrid"] as const).map((k) => (
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
                {dict.events.kinds[k]}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label>{dict.events.formTitle}</Label>
            <Input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
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

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label>{dict.events.startAt}</Label>
              <Input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>{dict.events.endAt}</Label>
              <Input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
              />
            </div>
          </div>

          {kind !== "online" && (
            <div className="space-y-1.5">
              <Label>{dict.events.location}</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={dict.events.locationPlaceholder}
                maxLength={300}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label>{dict.events.locationUrl}</Label>
            <Input
              type="url"
              value={locationUrl}
              onChange={(e) => setLocationUrl(e.target.value)}
              placeholder="https://..."
              maxLength={500}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{dict.events.description}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              minLength={20}
              maxLength={10000}
              required
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
              disabled={
                create.isPending ||
                !title ||
                !slug ||
                !description ||
                !startAt
              }
            >
              {create.isPending ? "..." : dict.events.publish}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
