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

export function AddSchoolForm({ lang, dict }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [foundedYear, setFoundedYear] = useState("");
  const [foundedPlace, setFoundedPlace] = useState("");
  const [founderName, setFounderName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const create = trpc.school.create.useMutation();

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
        foundedYear: foundedYear ? Number.parseInt(foundedYear, 10) : undefined,
        foundedPlace: foundedPlace || undefined,
        founderName: founderName || undefined,
        websiteUrl: websiteUrl || undefined,
      });
      router.push(`/${lang}/schools/${r.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        + {dict.schools.addButton}
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>{dict.schools.name}</Label>
            <Input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder={dict.schools.namePlaceholder}
              maxLength={300}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>{dict.schools.slug}</Label>
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
            <Label>{dict.schools.description}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              minLength={20}
              maxLength={5000}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label>{dict.schools.foundedYear}</Label>
              <Input
                value={foundedYear}
                onChange={(e) =>
                  setFoundedYear(e.target.value.replace(/\D/g, ""))
                }
                placeholder="1980"
                maxLength={4}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{dict.schools.foundedPlace}</Label>
              <Input
                value={foundedPlace}
                onChange={(e) => setFoundedPlace(e.target.value)}
                placeholder={dict.schools.foundedPlacePlaceholder}
                maxLength={200}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{dict.schools.founderName}</Label>
            <Input
              value={founderName}
              onChange={(e) => setFounderName(e.target.value)}
              placeholder={dict.schools.founderNamePlaceholder}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {dict.schools.founderHint}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>{dict.schools.websiteUrl}</Label>
            <Input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://..."
              maxLength={500}
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
              disabled={create.isPending || !name || !slug || !description}
            >
              {create.isPending ? "..." : dict.schools.create}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
