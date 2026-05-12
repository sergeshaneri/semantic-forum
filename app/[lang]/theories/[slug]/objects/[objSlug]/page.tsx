import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TheoryObjectActions } from "@/components/socionics/theory-object-actions";
import { auth } from "@/lib/auth/auth";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

export default async function TheoryObjectPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string; objSlug: string }>;
}) {
  const { lang, slug, objSlug } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  let data;
  try {
    data = await api.theory.getObject({
      theorySlug: slug,
      objectSlug: objSlug,
      language: lang,
    });
  } catch {
    notFound();
  }

  const { theory, object, citations } = data;
  const symbol =
    object.metadata &&
    typeof object.metadata === "object" &&
    "symbol" in object.metadata
      ? (object.metadata as { symbol?: string }).symbol
      : null;

  const session = await auth();
  const currentUserId =
    (session?.user as { id?: string } | undefined)?.id ?? null;
  const isOwner =
    currentUserId !== null && currentUserId === theory.authorId && !theory.isSeed;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-10">
      <Link
        href={`/${lang}/theories/${theory.slug}`}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
      >
        {dict.theoryObject.backToTheory} {theory.name}
      </Link>

      <header className="space-y-5">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs font-normal">
            {object.kind}
          </Badge>
          <Link
            href={`/${lang}/theories/${theory.slug}`}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
          >
            {theory.name}
          </Link>
          {isOwner && (
            <span className="ml-auto">
              <TheoryObjectActions
                object={{
                  id: object.id,
                  name: object.name,
                  description: object.description,
                }}
                theorySlug={theory.slug}
                lang={lang}
                dict={dict}
              />
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-4">
          {symbol && (
            <span className="font-mono font-semibold text-5xl text-foreground/40">
              {symbol}
            </span>
          )}
          <h1 className="font-heading text-5xl font-semibold tracking-tight leading-tight">
            {object.name}
          </h1>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
          {dict.theoryObject.descriptionTitle}
        </h2>
        <p className="text-lg leading-relaxed text-foreground whitespace-pre-line">
          {object.description}
        </p>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            {dict.theoryObject.citations}
          </h2>
          <span className="text-xs text-muted-foreground font-mono">
            ({citations.length})
          </span>
        </div>
        {citations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {dict.theoryObject.citationsEmpty}
          </p>
        ) : (
          <div className="space-y-3">
            {citations.map((c) => (
              <Card key={c.id} className="border-l-4 border-l-foreground/30">
                <CardHeader className="pb-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium text-foreground">
                      {c.authorName}
                    </span>
                    <span className="text-xs text-muted-foreground italic">
                      {c.sourceTitle}
                      {c.pageRef && `, ${c.pageRef}`}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <blockquote className="text-[15px] leading-relaxed text-foreground/90 italic">
                    «{c.quoteText}»
                  </blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
