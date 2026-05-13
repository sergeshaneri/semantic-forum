import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { AddPollForm } from "@/components/socionics/add-poll-form";
import { auth } from "@/lib/auth/auth";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

export default async function PollsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const session = await auth();
  const isAuthed = Boolean(session?.user);

  const list = await api.poll.list({ language: lang, limit: 50 });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-6">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-2 max-w-xl">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {dict.polls.title}
          </h1>
          <p className="text-sm text-muted-foreground">{dict.polls.subtitle}</p>
        </div>
        {isAuthed ? (
          <AddPollForm lang={lang} dict={dict} />
        ) : (
          <Link
            href={`/${lang}/login?callbackUrl=/${lang}/polls`}
            className="text-sm rounded-md border border-border px-3 py-1.5 hover:bg-muted transition-colors"
          >
            {dict.polls.loginToCreate}
          </Link>
        )}
      </header>

      {list.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {dict.polls.empty}
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {list.map((p) => (
            <li key={p.id}>
              <Link
                href={`/${lang}/polls/${p.slug}`}
                className="block rounded-md border border-border px-3 py-2.5 hover:bg-muted/40 transition-colors space-y-1"
              >
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="font-medium">{p.question}</h3>
                  <span className="text-xs text-muted-foreground ml-auto font-mono">
                    {p.voteCount} {dict.polls.voteCount}
                  </span>
                </div>
                {p.creator && (
                  <p className="text-xs text-muted-foreground">
                    {dict.polls.by} @{p.creator.username}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
