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

type Kind = "book" | "article" | "paper" | "video" | "podcast" | "website" | "other";

type Props = {
  schoolId: string;
  lang: Locale;
  dict: Dictionary;
};

const KINDS: Kind[] = ["book", "article", "paper", "video", "podcast", "website", "other"];

export function SchoolSourceForm({ schoolId, lang, dict }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const createSrc = trpc.source.create.useMutation();
  const link = trpc.school.addSource.useMutation();
  const [kind, setKind] = useState<Kind>("book");
  const [title, setTitle] = useState("");
  const [authorNames, setAuthorNames] = useState("");
  const [year, setYear] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      const src = await createSrc.mutateAsync({
        kind,
        title,
        authorNames: authorNames || undefined,
        year: year ? Number.parseInt(year, 10) : undefined,
        url: url || undefined,
        description: description || undefined,
        language: lang,
      });
      await link.mutateAsync({ schoolId, sourceId: src.id });
      setOpen(false);
      setTitle("");
      setAuthorNames("");
      setYear("");
      setUrl("");
      setDescription("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        + {dict.schools.addSourceButton}
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>{dict.schools.sourceKind}</Label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as Kind)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {dict.schools.sourceKinds[k]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>{dict.schools.sourceTitle}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={500}
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-1.5">
              <Label>{dict.schools.sourceAuthors}</Label>
              <Input
                value={authorNames}
                onChange={(e) => setAuthorNames(e.target.value)}
                placeholder="А. Аугустинавичюте, В. Гуленко"
                maxLength={500}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{dict.schools.sourceYear}</Label>
              <Input
                value={year}
                onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))}
                placeholder="1980"
                maxLength={4}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{dict.schools.sourceUrl}</Label>
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              maxLength={500}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{dict.schools.sourceDescription}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              maxLength={2000}
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
              disabled={createSrc.isPending || link.isPending}
            >
              {dict.addInterpretation.cancel}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createSrc.isPending || link.isPending || !title}
            >
              {createSrc.isPending || link.isPending ? "..." : dict.schools.addSourceConfirm}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
