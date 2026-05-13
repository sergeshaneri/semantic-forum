import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CoauthorsManager } from "@/components/socionics/coauthors-manager";
import { RevisionHistory } from "@/components/socionics/revision-history";
import { auth } from "@/lib/auth/auth";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

function getYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  return m?.[1] ?? null;
}

export default async function PublicationPage({
  params,
}: {
  params: Promise<{ lang: string; username: string; slug: string }>;
}) {
  const { lang, username, slug } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  let data;
  try {
    data = await api.publication.getBySlug({ username, slug, language: lang });
  } catch {
    notFound();
  }

  const { publication, author, tags, references } = data;
  const session = await auth();
  const currentUserId =
    (session?.user as { id?: string } | undefined)?.id ?? null;
  const isOwner = currentUserId === publication.authorId;
  const ytId = publication.externalUrl
    ? getYouTubeId(publication.externalUrl)
    : null;

  const created = new Date(publication.createdAt).toLocaleDateString(
    lang === "ru" ? "ru-RU" : "en-US",
    { day: "numeric", month: "long", year: "numeric" },
  );

  return (
    <article className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <Link
        href={`/${lang}/u/${username}`}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
      >
        {dict.publications.backToProfile} @{username}
      </Link>

      <header className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs font-normal">
            {publication.kind === "article"
              ? dict.publications.kindArticle
              : dict.publications.kindVideo}
          </Badge>
          {tags.map((t) => (
            <Link
              key={t.id}
              href={`/${lang}/tags/${t.slug}`}
              className="text-xs text-muted-foreground/80 font-mono hover:text-foreground transition-colors"
            >
              #{t.label}
            </Link>
          ))}
          <span className="text-xs text-muted-foreground ml-auto">
            {created}
          </span>
        </div>
        <h1 className="font-heading text-4xl font-semibold tracking-tight leading-tight">
          {publication.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          <Link
            href={`/${lang}/u/${author.username}`}
            className="text-foreground font-medium hover:underline underline-offset-2"
          >
            @{author.username}
          </Link>
        </p>
      </header>

      {publication.kind === "video" && publication.externalUrl && (
        <div className="aspect-video w-full rounded-lg overflow-hidden border border-border bg-muted">
          {ytId ? (
            <iframe
              src={`https://www.youtube.com/embed/${ytId}`}
              title={publication.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full p-6">
              <a
                href={publication.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline underline-offset-4"
              >
                {publication.externalUrl}
              </a>
            </div>
          )}
        </div>
      )}

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-[15px] leading-relaxed whitespace-pre-line text-foreground">
          {publication.body}
        </p>
      </div>

      <Separator />
      <section className="space-y-4">
        <CoauthorsManager
          kind="publication"
          id={publication.id}
          isOwner={isOwner}
          lang={lang}
          dict={dict}
        />
        <RevisionHistory
          kind="publication"
          id={publication.id}
          currentBody={publication.body}
          currentTitle={publication.title}
          dict={dict}
        />
      </section>

      {(references.entities.length > 0 ||
        references.theories.length > 0 ||
        references.objects.length > 0) && (
        <>
          <Separator />
          <section className="space-y-3">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
              {dict.publications.referencesTitle}
            </h2>
            <div className="flex flex-wrap gap-2">
              {references.entities.map((e) => (
                <Link
                  key={e.id}
                  href={`/${lang}/entities/${e.slug}`}
                  className="text-xs rounded-md border border-border px-2.5 py-1 hover:bg-muted transition-colors"
                >
                  {e.title}
                </Link>
              ))}
              {references.theories.map((t) => (
                <Link
                  key={t.id}
                  href={`/${lang}/theories/${t.slug}`}
                  className="text-xs rounded-md border border-border px-2.5 py-1 hover:bg-muted transition-colors"
                >
                  {t.name}
                </Link>
              ))}
              {references.objects.map((o) => (
                <Link
                  key={o.id}
                  href={
                    o.theory
                      ? `/${lang}/theories/${o.theory.slug}/objects/${o.slug}`
                      : "#"
                  }
                  className="text-xs rounded-md border border-border px-2.5 py-1 hover:bg-muted transition-colors"
                >
                  {o.name}
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </article>
  );
}
