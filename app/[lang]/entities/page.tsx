import { notFound } from "next/navigation";
import { EntityCard } from "@/components/socionics/entity-card";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

export default async function EntitiesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const entities = await api.entity.list({ language: lang });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-8">
      <header className="space-y-3 max-w-2xl">
        <h1 className="font-heading text-4xl font-semibold tracking-tight">
          {dict.entities.title}
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          {dict.entities.subtitle}
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entities.map((e) => (
          <EntityCard key={e.id} lang={lang} dict={dict} entity={e} />
        ))}
      </div>
    </div>
  );
}
