import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AddInterpretationForm } from "@/components/socionics/add-interpretation-form";
import { AddToCollectionMenu } from "@/components/socionics/add-to-collection-menu";
import { Annotations } from "@/components/socionics/annotations";
import { BookmarkButton } from "@/components/socionics/bookmark-button";
import { EntityHeaderActions } from "@/components/socionics/entity-header-actions";
import { EntityRelations } from "@/components/socionics/entity-relations";
import { InterpretationCard } from "@/components/socionics/interpretation-card";
import { Markdown } from "@/components/socionics/markdown";
import { MaterialEmbed } from "@/components/socionics/material-embed";
import { TheoryFilter } from "@/components/socionics/theory-filter";
import { auth } from "@/lib/auth/auth";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { interpretationsCount } from "@/lib/i18n/formatters";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

export default async function EntityPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; slug: string }>;
  searchParams: Promise<{ theory?: string }>;
}) {
  const { lang, slug } = await params;
  const { theory: theorySlug } = await searchParams;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const session = await auth();
  const isAuthed = Boolean(session?.user);
  const currentUserId =
    (session?.user as { id?: string } | undefined)?.id ?? null;

  let data;
  try {
    data = await api.entity.getBySlug({
      slug,
      language: lang,
      theorySlug: theorySlug,
    });
  } catch {
    notFound();
  }

  const { entity, interpretations, theoryChoices } = data;
  const annotations = await api.annotation.list({ entityId: entity.id });
  const kindLabel =
    entity.kind === "word"
      ? dict.entities.kindWord
      : entity.kind === "person"
        ? dict.entities.kindPerson
        : dict.entities.kindMaterial;
  const isEntityOwner =
    currentUserId !== null && currentUserId === entity.createdBy;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10">
      <Link
        href={`/${lang}/entities`}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
      >
        {dict.entities.backToList}
      </Link>

      <header className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs font-normal">
            {kindLabel}
          </Badge>
          {entity.tags.map((t) => (
            <span
              key={t}
              className="text-xs text-muted-foreground/80 font-mono"
            >
              #{t}
            </span>
          ))}
          <span className="ml-auto inline-flex items-center gap-2">
            <BookmarkButton
              targetType="entity"
              targetId={entity.id}
              isAuthed={isAuthed}
              loginHref={`/${lang}/login?callbackUrl=/${lang}/entities/${entity.slug}`}
            />
            <AddToCollectionMenu
              targetType="entity"
              targetId={entity.id}
              isAuthed={isAuthed}
              loginHref={`/${lang}/login?callbackUrl=/${lang}/entities/${entity.slug}`}
              dict={dict}
            />
            {isEntityOwner && (
              <EntityHeaderActions
                entity={{
                  id: entity.id,
                  title: entity.title,
                  descriptionWiki: entity.descriptionWiki,
                  slug: entity.slug,
                }}
                lang={lang}
                dict={dict}
              />
            )}
          </span>
        </div>
        <h1 className="font-heading text-5xl font-semibold tracking-tight leading-tight">
          {entity.title}
        </h1>
      </header>

      {entity.kind === "material" && entity.embedUrl && (
        <section className="space-y-2">
          <MaterialEmbed embedUrl={entity.embedUrl} title={entity.title} />
          {entity.sourceUrl && (
            <p className="text-xs text-muted-foreground">
              <a
                href={entity.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                {entity.sourceUrl}
              </a>
            </p>
          )}
        </section>
      )}

      <section
        className="space-y-3 text-foreground"
        data-annotation-source="true"
      >
        <Markdown>{entity.descriptionWiki}</Markdown>
      </section>

      <Separator />

      <section className="space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              {interpretationsCount(interpretations.length, lang)}
            </h2>
            {theoryChoices.length > 0 && (
              <TheoryFilter
                dict={dict}
                choices={theoryChoices}
                current={theorySlug ?? null}
              />
            )}
          </div>
          {isAuthed ? (
            <AddInterpretationForm
              entityId={entity.id}
              lang={lang}
              dict={dict}
            />
          ) : (
            <Link
              href={`/${lang}/login?callbackUrl=/${lang}/entities/${entity.slug}`}
              className="text-sm rounded-md border border-border px-3 py-1.5 hover:bg-muted transition-colors"
            >
              {dict.addInterpretation.loginToAdd}
            </Link>
          )}
        </div>

        <div className="space-y-4">
          {interpretations.map((i) => (
            <InterpretationCard
              key={i.id}
              lang={lang}
              dict={dict}
              interpretation={i}
              isAuthed={isAuthed}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      </section>

      <Separator />

      <Annotations
        entityId={entity.id}
        initial={annotations}
        isAuthed={isAuthed}
        currentUserId={currentUserId}
        loginHref={`/${lang}/login?callbackUrl=/${lang}/entities/${entity.slug}`}
        lang={lang}
        dict={dict}
      />

      <Separator />

      <EntityRelations
        entityId={entity.id}
        entitySlug={entity.slug}
        lang={lang}
        dict={dict}
        isAuthed={isAuthed}
        currentUserId={currentUserId}
      />
    </div>
  );
}
