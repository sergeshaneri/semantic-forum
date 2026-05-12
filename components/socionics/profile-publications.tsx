"use client";

import Link from "next/link";
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

type Publication = {
  id: string;
  kind: "article" | "video";
  title: string;
  slug: string;
  externalUrl: string | null;
  tags: { id: string; label: string; slug: string }[];
  createdAt: Date;
};

type Props = {
  username: string;
  isSelf: boolean;
  publications: Publication[];
  lang: Locale;
  dict: Dictionary;
};

export function ProfilePublications({
  username,
  isSelf,
  publications,
  lang,
  dict,
}: Props) {
  const [adding, setAdding] = useState(false);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          {dict.publications.title}
        </h2>
        {isSelf && !adding && (
          <Button size="sm" onClick={() => setAdding(true)}>
            + {dict.publications.addButton}
          </Button>
        )}
      </div>

      {adding && (
        <AddPublicationForm
          lang={lang}
          dict={dict}
          username={username}
          onCancel={() => setAdding(false)}
          onCreated={() => setAdding(false)}
        />
      )}

      {publications.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {dict.publications.empty}
        </p>
      ) : (
        <ul className="space-y-3">
          {publications.map((p) => (
            <li key={p.id}>
              <Link
                href={`/${lang}/u/${username}/p/${p.slug}`}
                className="block"
              >
                <Card className="hover:border-foreground/40 transition-colors">
                  <CardContent className="py-3 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                      <span className="font-mono uppercase tracking-wider">
                        {p.kind === "article"
                          ? dict.publications.kindArticle
                          : dict.publications.kindVideo}
                      </span>
                      {p.tags.map((t) => (
                        <span
                          key={t.id}
                          className="font-mono text-muted-foreground/80"
                        >
                          #{t.label}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-heading text-lg">{p.title}</h3>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AddPublicationForm({
  lang,
  dict,
  username,
  onCancel,
  onCreated,
}: {
  lang: Locale;
  dict: Dictionary;
  username: string;
  onCancel: () => void;
  onCreated: () => void;
}) {
  const router = useRouter();
  const create = trpc.publication.create.useMutation();
  const [kind, setKind] = useState<"article" | "video">("article");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [body, setBody] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const tagsArr = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      const r = await create.mutateAsync({
        kind,
        title,
        slug,
        body,
        externalUrl: externalUrl || undefined,
        language: lang,
        tags: tagsArr,
        references: [],
      });
      onCreated();
      router.push(`/${lang}/u/${username}/p/${r.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex gap-2">
            {(["article", "video"] as const).map((k) => (
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
                {k === "article"
                  ? dict.publications.kindArticle
                  : dict.publications.kindVideo}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label>{dict.publications.formTitle}</Label>
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

          {kind === "video" && (
            <div className="space-y-1.5">
              <Label>{dict.publications.videoUrl}</Label>
              <Input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                maxLength={500}
                required
              />
              <p className="text-xs text-muted-foreground">
                {dict.publications.videoHint}
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>
              {kind === "article"
                ? dict.publications.bodyArticle
                : dict.publications.bodyVideoDescription}
            </Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={kind === "article" ? 10 : 4}
              minLength={20}
              maxLength={50000}
              required
            />
            <p className="text-xs text-muted-foreground">{body.length}/50000</p>
          </div>

          <div className="space-y-1.5">
            <Label>{dict.publications.tags}</Label>
            <Input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder={dict.publications.tagsPlaceholder}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {dict.publications.tagsHint}
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
              onClick={onCancel}
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
                !body ||
                (kind === "video" && !externalUrl)
              }
            >
              {create.isPending ? "..." : dict.publications.publish}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
