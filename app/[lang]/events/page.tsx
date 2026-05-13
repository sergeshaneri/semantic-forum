import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AddEventButton } from "@/components/socionics/add-event";
import { auth } from "@/lib/auth/auth";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

export default async function EventsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const session = await auth();
  const isAuthed = Boolean(session?.user);
  const list = await api.event.list({
    language: lang,
    upcomingOnly: true,
    limit: 50,
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-6">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-2 max-w-xl">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            {dict.events.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {dict.events.subtitle}
          </p>
        </div>
        {isAuthed ? (
          <AddEventButton lang={lang} dict={dict} />
        ) : (
          <Link
            href={`/${lang}/login?callbackUrl=/${lang}/events`}
            className="text-sm rounded-md border border-border px-3 py-1.5 hover:bg-muted transition-colors"
          >
            {dict.events.loginToAdd}
          </Link>
        )}
      </header>

      {list.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {dict.events.empty}
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {list.map((e) => (
            <li key={e.id}>
              <Link
                href={`/${lang}/events/${e.slug}`}
                className="block rounded-md border border-border px-3 py-2.5 hover:bg-muted/40 transition-colors space-y-1"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs font-normal">
                    {dict.events.kinds[e.kind]}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">
                    {new Date(e.startAt).toLocaleString(
                      lang === "ru" ? "ru-RU" : "en-US",
                      {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {e.attendeeCount} {dict.events.attendeesShort}
                  </span>
                </div>
                <h3 className="text-base font-medium">{e.title}</h3>
                {e.location && (
                  <p className="text-xs text-muted-foreground">
                    📍 {e.location}
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
