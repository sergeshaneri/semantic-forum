import Link from "next/link";
import { notFound } from "next/navigation";
import { AddEntityForm } from "@/components/socionics/add-entity-form";
import { EntityCard } from "@/components/socionics/entity-card";
import { auth } from "@/lib/auth/auth";
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
  const session = await auth();
  const isAuthed = Boolean(session?.user);
  const entities = await api.entity.list({ language: lang });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-8">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-3 max-w-2xl">
          <h1 className="font-heading text-4xl font-semibold tracking-tight">
            {dict.entities.title}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            {dict.entities.subtitle}
          </p>
        </div>
        {isAuthed ? (
          <AddEntityForm lang={lang} dict={dict} />
        ) : (
          <Link
            href={`/${lang}/login?callbackUrl=/${lang}/entities`}
            className="text-sm rounded-md border border-border px-3 py-1.5 hover:bg-muted transition-colors"
          >
            {dict.addEntity.loginToAdd}
          </Link>
        )}
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entities.map((e) => (
          <EntityCard key={e.id} lang={lang} dict={dict} entity={e} />
        ))}
      </div>
    </div>
  );
}
