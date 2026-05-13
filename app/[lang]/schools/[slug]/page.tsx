import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AddToCollectionMenu } from "@/components/socionics/add-to-collection-menu";
import { BookmarkButton } from "@/components/socionics/bookmark-button";
import { Markdown } from "@/components/socionics/markdown";
import { SchoolSourceForm } from "@/components/socionics/school-source-form";
import { auth } from "@/lib/auth/auth";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

export default async function SchoolPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const session = await auth();
  const isAuthed = Boolean(session?.user);
  const currentUserId =
    (session?.user as { id?: string } | undefined)?.id ?? null;

  let data;
  try {
    data = await api.school.getBySlug({ slug, language: lang });
  } catch {
    notFound();
  }

  const { school, sources, members } = data;
  const isEditor =
    currentUserId !== null &&
    !school.isSeed &&
    currentUserId === school.createdBy;

  return (
    <article className="mx-auto max-w-4xl px-6 py-12 space-y-10">
      <Link
        href={`/${lang}/schools`}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
      >
        ← {dict.schools.title}
      </Link>

      <header className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          {school.isSeed && (
            <Badge variant="default" className="text-xs">
              {dict.theories.seed}
            </Badge>
          )}
          {school.foundedYear && (
            <span className="text-xs text-muted-foreground font-mono">
              {school.foundedYear}
              {school.foundedPlace ? ` · ${school.foundedPlace}` : ""}
            </span>
          )}
          <span className="ml-auto inline-flex items-center gap-2">
            <BookmarkButton
              targetType="entity"
              targetId={school.id}
              isAuthed={isAuthed}
              loginHref={`/${lang}/login?callbackUrl=/${lang}/schools/${school.slug}`}
            />
            <AddToCollectionMenu
              targetType="school"
              targetId={school.id}
              isAuthed={isAuthed}
              loginHref={`/${lang}/login?callbackUrl=/${lang}/schools/${school.slug}`}
              dict={dict}
            />
          </span>
        </div>
        <h1 className="font-heading text-5xl font-semibold tracking-tight leading-tight">
          {school.name}
        </h1>
        {school.founderName && (
          <p className="text-sm text-muted-foreground">
            {dict.schools.founderLabel}: <strong>{school.founderName}</strong>
          </p>
        )}
        {school.websiteUrl && (
          <p className="text-sm">
            <a
              href={school.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-2"
            >
              {school.websiteUrl}
            </a>
          </p>
        )}
      </header>

      <section className="space-y-3">
        <Markdown>{school.description}</Markdown>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {dict.schools.literatureTitle}
          </h2>
          {isEditor && <SchoolSourceForm schoolId={school.id} lang={lang} dict={dict} />}
        </div>
        {sources.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {dict.schools.literatureEmpty}
          </p>
        ) : (
          <ul className="space-y-2">
            {sources.map((s) => (
              <li
                key={s.id}
                className="rounded-md border border-border px-3 py-2.5 space-y-1"
              >
                <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs font-normal">
                    {dict.schools.sourceKinds[s.kind]}
                  </Badge>
                  {s.year && <span className="font-mono">{s.year}</span>}
                  {s.authorNames && (
                    <span className="text-muted-foreground">
                      {s.authorNames}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-foreground">
                  {s.url ? (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline underline-offset-2"
                    >
                      {s.title}
                    </a>
                  ) : (
                    s.title
                  )}
                </p>
                {s.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {s.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {members.length > 0 && (
        <>
          <Separator />
          <section className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              {dict.schools.membersTitle} ({members.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => (
                <Link
                  key={m.id}
                  href={`/${lang}/u/${m.username}`}
                  className="inline-flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-sm hover:bg-muted transition-colors"
                >
                  <span className="size-6 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-semibold">
                    {(m.username[0] ?? "u").toUpperCase()}
                  </span>
                  <span>{m.name || `@${m.username}`}</span>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </article>
  );
}
