import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AddTheoryObjectForm } from "@/components/socionics/add-theory-object-form";
import { TheoryHeaderActions } from "@/components/socionics/theory-header-actions";
import { auth } from "@/lib/auth/auth";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

const kindOrder = [
  "aspect",
  "function_position",
  "type",
  "intertype_relation",
  "dichotomy",
  "custom",
] as const;

const kindLabelsRu: Record<string, string> = {
  aspect: "Аспекты",
  function_position: "Функции-позиции",
  type: "Типы (ТИМы)",
  intertype_relation: "Интертипные отношения",
  dichotomy: "Признаки и дихотомии",
  custom: "Пользовательские",
};

const kindLabelsEn: Record<string, string> = {
  aspect: "Aspects",
  function_position: "Function positions",
  type: "Types (TIMs)",
  intertype_relation: "Intertype relations",
  dichotomy: "Dichotomies",
  custom: "Custom",
};

export default async function TheoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; slug: string }>;
  searchParams: Promise<{ kind?: string }>;
}) {
  const { lang, slug } = await params;
  const { kind: activeKind } = await searchParams;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  let data;
  try {
    data = await api.theory.getBySlug({ slug, language: lang });
  } catch {
    notFound();
  }

  const { theory, objects, interpretationCount } = data;
  const kindLabels = lang === "ru" ? kindLabelsRu : kindLabelsEn;
  const session = await auth();
  const isAuthed = Boolean(session?.user);
  const currentUserId =
    (session?.user as { id?: string } | undefined)?.id ?? null;
  const isOwner =
    currentUserId !== null && currentUserId === theory.authorId && !theory.isSeed;

  const visibleObjects = activeKind
    ? objects.filter((o) => o.kind === activeKind)
    : objects;

  const grouped = kindOrder
    .map((kind) => ({
      kind,
      label: kindLabels[kind],
      items: objects.filter((o) => o.kind === kind),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-10">
      <Link
        href={`/${lang}/theories`}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
      >
        ← {dict.nav.theories}
      </Link>

      <header className="space-y-5">
        <div className="flex items-center gap-2 flex-wrap">
          {theory.isSeed && (
            <Badge variant="default" className="text-xs">
              {dict.theories.seed}
            </Badge>
          )}
          {theory.parentTheory && (
            <Badge variant="outline" className="text-xs font-normal">
              ↗ {dict.theories.parent}: {theory.parentTheory.name}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground font-mono ml-auto">
            {theory.forkCount} {dict.theories.forks} ·{" "}
            {interpretationCount} {dict.theories.interpretationsInTheory}
          </span>
        </div>
        <h1 className="font-heading text-5xl font-semibold tracking-tight leading-tight">
          {theory.name}
        </h1>
        {theory.author && (
          <p className="text-sm text-muted-foreground">
            <Link
              href={`/${lang}/u/${theory.author.username}`}
              className="hover:underline underline-offset-2"
            >
              @{theory.author.username}
            </Link>{" "}
            · {theory.author.karma} {dict.interpretation.karma}
          </p>
        )}
        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
          {theory.description}
        </p>
        <div className="flex gap-3 flex-wrap items-center pt-2">
          <TheoryHeaderActions
            theory={{
              id: theory.id,
              slug: theory.slug,
              name: theory.name,
              description: theory.description,
              isSeed: theory.isSeed,
              authorId: theory.authorId,
            }}
            lang={lang}
            dict={dict}
            isAuthed={isAuthed}
            isOwner={isOwner}
          />
        </div>
      </header>

      <Separator />

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {dict.theories.objectsTitle}
          </h2>
          {isOwner && (
            <AddTheoryObjectForm
              theoryId={theory.id}
              lang={lang}
              dict={dict}
            />
          )}
        </div>

        {grouped.length > 1 && (
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              href={`/${lang}/theories/${theory.slug}`}
              className={`rounded-full border px-3 py-1 transition-colors ${
                !activeKind
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:bg-muted text-muted-foreground"
              }`}
            >
              {dict.theories.objectsTitle.toLowerCase()} ({objects.length})
            </Link>
            {grouped.map((g) => (
              <Link
                key={g.kind}
                href={`/${lang}/theories/${theory.slug}?kind=${g.kind}`}
                className={`rounded-full border px-3 py-1 transition-colors ${
                  activeKind === g.kind
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                {g.label} ({g.items.length})
              </Link>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {visibleObjects.map((obj) => {
            const symbol =
              obj.metadata &&
              typeof obj.metadata === "object" &&
              "symbol" in obj.metadata
                ? (obj.metadata as { symbol?: string }).symbol
                : null;
            return (
              <Link
                key={obj.id}
                href={`/${lang}/theories/${theory.slug}/objects/${obj.slug}`}
                className="contents"
              >
                <Card className="group hover:border-foreground/40 transition-colors cursor-pointer">
                  <CardHeader className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      {symbol && (
                        <span className="font-mono font-semibold text-base text-foreground">
                          {symbol}
                        </span>
                      )}
                      <h4 className="font-heading text-base font-medium group-hover:underline underline-offset-4 decoration-1">
                        {obj.name}
                      </h4>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {obj.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
