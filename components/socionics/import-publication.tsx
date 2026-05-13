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

type Props = {
  username: string;
  lang: Locale;
  dict: Dictionary;
};

export function ImportPublicationButton({ username, lang, dict }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<{
    title: string;
    body: string;
    sourceUrl: string;
    source: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const previewMutation = trpc.import.preview.useMutation();
  const createMutation = trpc.import.asPublication.useMutation();

  async function onPreview(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPreview(null);
    try {
      const p = await previewMutation.mutateAsync({ url });
      setPreview(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  async function onCreate() {
    if (!preview) return;
    setError(null);
    try {
      const r = await createMutation.mutateAsync({
        url: preview.sourceUrl,
        language: lang,
      });
      setOpen(false);
      setPreview(null);
      setUrl("");
      router.push(`/${lang}/u/${username}/p/${r.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        {dict.publications.importButton}
      </Button>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-5 space-y-4">
        <div className="space-y-1">
          <h3 className="font-heading text-lg font-semibold">
            {dict.publications.importTitle}
          </h3>
          <p className="text-xs text-muted-foreground">
            {dict.publications.importHint}
          </p>
        </div>

        <form onSubmit={onPreview} className="space-y-2">
          <Label>URL</Label>
          <div className="flex gap-2">
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={dict.publications.importUrlPlaceholder}
              required
              maxLength={2000}
              className="flex-1"
            />
            <Button
              type="submit"
              size="sm"
              disabled={previewMutation.isPending || !url}
            >
              {previewMutation.isPending
                ? "…"
                : dict.publications.importPreview}
            </Button>
          </div>
        </form>

        {error && (
          <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
        )}

        {preview && (
          <div className="space-y-3 border-t border-border pt-4">
            <div className="space-y-1.5">
              <Label>{dict.publications.formTitle}</Label>
              <Input
                value={preview.title}
                readOnly
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{dict.publications.bodyArticle}</Label>
              <Textarea
                value={preview.body}
                readOnly
                rows={Math.min(
                  10,
                  Math.max(4, preview.body.split("\n").length),
                )}
                className="text-sm font-mono"
              />
              <p className="text-xs text-muted-foreground">
                {preview.body.length} chars · source: {preview.source}
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setOpen(false);
                  setPreview(null);
                  setUrl("");
                }}
                disabled={createMutation.isPending}
              >
                {dict.actions.cancel}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={onCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending
                  ? "…"
                  : dict.publications.importCreate}
              </Button>
            </div>
          </div>
        )}

        {!preview && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setOpen(false);
                setUrl("");
                setError(null);
              }}
            >
              {dict.actions.cancel}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
