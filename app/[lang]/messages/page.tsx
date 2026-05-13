import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth/auth";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

export default async function MessagesListPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const session = await auth();
  if (!session?.user) {
    redirect(`/${lang}/login?callbackUrl=/${lang}/messages`);
  }

  const threads = await api.dm.threads();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-6">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {dict.dm.title}
        </h1>
        <p className="text-sm text-muted-foreground">{dict.dm.subtitle}</p>
      </header>

      {threads.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {dict.dm.empty}
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {threads.map((t) => {
            const other = t.others[0];
            if (!other) return null;
            return (
              <li key={t.id}>
                <Link
                  href={`/${lang}/messages/${t.id}`}
                  className="block rounded-md border border-border px-3 py-2.5 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {other.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={other.image}
                        alt={other.name || other.username}
                        className="size-10 rounded-full object-cover border border-border shrink-0"
                      />
                    ) : (
                      <span className="size-10 shrink-0 rounded-full bg-foreground/10 flex items-center justify-center text-sm font-semibold uppercase">
                        {(other.name || other.username || "u").slice(0, 2)}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-medium">
                          {other.name || `@${other.username}`}
                        </span>
                        <span className="text-xs text-muted-foreground/70 font-mono">
                          @{other.username}
                        </span>
                        {t.unread > 0 && (
                          <span className="ml-auto text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-foreground text-background">
                            {t.unread} {dict.dm.unreadShort}
                          </span>
                        )}
                      </div>
                      {t.lastMessage ? (
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                          {t.lastMessage.fromMe ? `${dict.dm.me}: ` : ""}
                          {t.lastMessage.body}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground/60 italic mt-0.5">
                          {dict.dm.threadEmpty}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
