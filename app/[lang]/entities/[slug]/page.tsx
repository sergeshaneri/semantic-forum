import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AddInterpretationForm } from "@/components/socionics/add-interpretation-form";
import { InterpretationCard } from "@/components/socionics/interpretation-card";
import { auth } from "@/lib/auth/auth";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { interpretationsCount } from "@/lib/i18n/formatters";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

export default async function EntityPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const session = await auth();
  const isAuthed = Boolean(session?.user);

  let data;
  try {
    data = await api.entity.getBySlug({ slug, language: lang });
  } catch {
    notFound();
  }

  const { entity, interpretations } = data;
  const kindLabel =
    entity.kind === "word" ? dict.entities.kindWord : dict.entities.kindPerson;

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
        </div>
        <h1 className="font-heading text-5xl font-semibold tracking-tight leading-tight">
          {entity.title}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
          {entity.descriptionWiki}
        </p>
      </header>

      <Separator />

      <section className="space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              {interpretationsCount(interpretations.length, lang)}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {dict.interpretation.filterByTheory}: {dict.interpretation.allTheories}
            </p>
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
            />
          ))}
        </div>
      </section>
    </div>
  );
}
