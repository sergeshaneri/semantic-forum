import Link from "next/link";
import { notFound } from "next/navigation";
import { EntityCard } from "@/components/socionics/entity-card";
import { TheoryCard } from "@/components/socionics/theory-card";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const [popularEntities, theories] = await Promise.all([
    api.entity.popular({ language: lang, limit: 4 }),
    api.theory.list({ language: lang }),
  ]);
  const topTheories = [...theories]
    .sort((a, b) => b.ratingAvg - a.ratingAvg)
    .slice(0, 2);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-16">
      <section className="space-y-6 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground font-mono">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {dict.health.stub}
        </div>
        <h1 className="font-heading text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
          {dict.appName}
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          {dict.tagline}
        </p>
        <p className="text-base text-muted-foreground/90 leading-relaxed">
          {dict.home.intro}
        </p>
        <div className="flex gap-3 pt-2">
          <Link
            href={`/${lang}/entities`}
            className="inline-flex items-center rounded-md bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {dict.nav.entities} →
          </Link>
          <Link
            href={`/${lang}/theories`}
            className="inline-flex items-center rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            {dict.nav.theories}
          </Link>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {dict.home.popularEntities}
          </h2>
          <Link
            href={`/${lang}/entities`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {dict.home.explore} →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {popularEntities.map((e) => (
            <EntityCard key={e.id} lang={lang} dict={dict} entity={e} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {dict.home.popularTheories}
          </h2>
          <Link
            href={`/${lang}/theories`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {dict.home.explore} →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topTheories.map((t) => (
            <TheoryCard key={t.id} lang={lang} dict={dict} theory={t} />
          ))}
        </div>
      </section>
    </div>
  );
}
