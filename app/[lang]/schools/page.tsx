import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddSchoolForm } from "@/components/socionics/add-school-form";
import { auth } from "@/lib/auth/auth";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

export default async function SchoolsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const session = await auth();
  const isAuthed = Boolean(session?.user);
  const list = await api.school.list({ language: lang });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-8">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-3 max-w-2xl">
          <h1 className="font-heading text-4xl font-semibold tracking-tight">
            {dict.schools.title}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            {dict.schools.subtitle}
          </p>
        </div>
        {isAuthed ? (
          <AddSchoolForm lang={lang} dict={dict} />
        ) : (
          <Link
            href={`/${lang}/login?callbackUrl=/${lang}/schools`}
            className="text-sm rounded-md border border-border px-3 py-1.5 hover:bg-muted transition-colors"
          >
            {dict.schools.loginToAdd}
          </Link>
        )}
      </header>

      {list.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {dict.schools.empty}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {list.map((s) => (
            <Link
              key={s.id}
              href={`/${lang}/schools/${s.slug}`}
              className="block"
            >
              <Card className="hover:border-foreground/40 transition-colors h-full">
                <CardHeader className="pb-2 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {s.isSeed && (
                      <Badge variant="default" className="text-xs">
                        {dict.theories.seed}
                      </Badge>
                    )}
                    {s.foundedYear && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {s.foundedYear}
                        {s.foundedPlace ? ` · ${s.foundedPlace}` : ""}
                      </span>
                    )}
                    <span className="ml-auto text-xs text-muted-foreground font-mono">
                      {s.sourceCount} {dict.schools.sourcesShort} ·{" "}
                      {s.memberCount} {dict.schools.membersShort}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{s.name}</CardTitle>
                  {s.founderName && (
                    <p className="text-xs text-muted-foreground">
                      {dict.schools.founderLabel}: {s.founderName}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {s.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
