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

type Kind =
  | "aspect"
  | "function_position"
  | "type"
  | "intertype_relation"
  | "dichotomy"
  | "custom";

const KINDS: Kind[] = [
  "custom",
  "aspect",
  "function_position",
  "type",
  "intertype_relation",
  "dichotomy",
];

type Props = {
  theoryId: string;
  lang: Locale;
  dict: Dictionary;
};

export function AddTheoryObjectForm({ theoryId, lang, dict }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const create = trpc.theoryObject.create.useMutation();
  const [kind, setKind] = useState<Kind>("custom");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({
        theoryId,
        kind,
        name,
        slug,
        description,
        language: lang,
      });
      setOpen(false);
      setName("");
      setSlug("");
      setDescription("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        + {dict.addTheoryObject.button}
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="to-kind">{dict.addTheoryObject.kind}</Label>
            <select
              id="to-kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as Kind)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {dict.addTheoryObject.kinds[k]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="to-name">{dict.addTheoryObject.name}</Label>
            <Input
              id="to-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="to-slug">{dict.addTheoryObject.slug}</Label>
            <Input
              id="to-slug"
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
            <Label htmlFor="to-desc">{dict.addTheoryObject.description}</Label>
            <Textarea
              id="to-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              minLength={10}
              maxLength={5000}
              required
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/5000
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
              disabled={create.isPending || !name || !slug || !description}
            >
              {create.isPending ? "..." : dict.addTheoryObject.create}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
