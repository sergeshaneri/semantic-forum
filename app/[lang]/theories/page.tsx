import Link from "next/link";
import { notFound } from "next/navigation";
import { AddTheoryForm } from "@/components/socionics/add-theory-form";
import { TheoryCard } from "@/components/socionics/theory-card";
import { auth } from "@/lib/auth/auth";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

export default async function TheoriesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const session = await auth();
  const isAuthed = Boolean(session?.user);
  const theories = await api.theory.list({ language: lang });

  const sorted = [...theories].sort((a, b) => {
    if (a.isSeed !== b.isSeed) return a.isSeed ? -1 : 1;
    return b.ratingAvg - a.ratingAvg;
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 space-y-8">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-3 max-w-2xl">
          <h1 className="font-heading text-4xl font-semibold tracking-tight">
            {dict.theories.title}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            {dict.theories.subtitle}
          </p>
        </div>
        {isAuthed ? (
          <AddTheoryForm lang={lang} dict={dict} />
        ) : (
          <Link
            href={`/${lang}/login?callbackUrl=/${lang}/theories`}
            className="text-sm rounded-md border border-border px-3 py-1.5 hover:bg-muted transition-colors"
          >
            {dict.addTheory.button}
          </Link>
        )}
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sorted.map((t) => (
          <TheoryCard key={t.id} lang={lang} dict={dict} theory={t} />
        ))}
      </div>
    </div>
  );
}
