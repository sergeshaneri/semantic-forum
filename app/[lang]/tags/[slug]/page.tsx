import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

export default async function TagPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  let data;
  try {
    data = await api.tag.getBySlug({ slug, language: lang });
  } catch {
    notFound();
  }

  const { tag, entities, publications } = data;
  const isEmpty = entities.length === 0 && publications.length === 0;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
          {dict.tags.title}
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          #{tag.label}
        </h1>
      </header>

      {isEmpty ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {dict.tags.notFound}
          </CardContent>
        </Card>
      ) : (
        <>
          {entities.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
                {dict.tags.entitiesSection} ({entities.length})
              </h2>
              <ul className="space-y-1.5">
                {entities.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/${lang}/entities/${e.slug}`}
                      className="block rounded-md border border-border px-3 py-2 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-baseline gap-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-normal"
                        >
                          {e.kind === "word"
                            ? dict.entities.kindWord
                            : e.kind === "person"
                              ? dict.entities.kindPerson
                              : dict.entities.kindMaterial}
                        </Badge>
                        <span className="font-medium">{e.title}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {publications.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
                {dict.tags.publicationsSection} ({publications.length})
              </h2>
              <ul className="space-y-1.5">
                {publications.map((p) => (
                  <li key={p.id}>
                    {p.author ? (
                      <Link
                        href={`/${lang}/u/${p.author.username}/p/${p.slug}`}
                        className="block rounded-md border border-border px-3 py-2 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-normal"
                          >
                            {p.kind === "article"
                              ? dict.publications.kindArticle
                              : dict.publications.kindVideo}
                          </Badge>
                          <span className="font-medium">{p.title}</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            @{p.author.username}
                          </span>
                        </div>
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
