"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, use, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc/react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { slugify } from "@/lib/slug";
import { useSession } from "@/lib/auth/session-context";
import type { Locale } from "@/lib/i18n/config";

export default function CollectionsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const dict = getDictionary(lang as Locale);
  const router = useRouter();
  const list = trpc.collection.mine.useQuery();
  const create = trpc.collection.create.useMutation();
  const session = useSession();
  const username = session?.username;

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
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
        name,
        slug,
        description: description || undefined,
        isPublic,
      });
      setOpen(false);
      setName("");
      setSlug("");
      setDescription("");
      list.refetch();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  const items = list.data ?? [];

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-6">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-2 max-w-xl">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {dict.collections.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {dict.collections.subtitle}
          </p>
        </div>
        {!open && (
          <Button size="sm" onClick={() => setOpen(true)}>
            + {dict.collections.create}
          </Button>
        )}
      </header>

      {open && (
        <Card>
          <CardContent className="pt-5">
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label>{dict.collections.name}</Label>
                <Input
                  value={name}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder={dict.collections.namePlaceholder}
                  maxLength={200}
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
                <Label>{dict.collections.description}</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  maxLength={1000}
                />
              </div>
              <label className="text-sm flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                {dict.collections.isPublic}
              </label>
              {error && (
                <p className="text-sm text-rose-600 dark:text-rose-400">
                  {error}
                </p>
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
                  disabled={create.isPending || !name || !slug}
                >
                  {create.isPending ? "..." : dict.collections.create}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {list.isLoading ? (
        <p className="text-sm text-muted-foreground">…</p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {dict.collections.empty}
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {items.map((c) => (
            <li key={c.id}>
              <Link
                href={
                  username
                    ? `/${lang}/u/${username}/collections/${c.slug}`
                    : "#"
                }
                className="block rounded-md border border-border px-3 py-2.5 hover:bg-muted/40 transition-colors space-y-1"
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium">{c.name}</h3>
                  <span className="text-xs text-muted-foreground font-mono">
                    {c.itemCount} {dict.collections.itemsShort}
                  </span>
                  {!c.isPublic && (
                    <span className="text-xs text-amber-600 ml-auto">
                      🔒 {dict.collections.privateLabel}
                    </span>
                  )}
                </div>
                {c.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {c.description}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
