import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

type Tab = "available" | "seeking";

export default async function MentorsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { lang } = await params;
  const { tab: tabRaw } = await searchParams;
  if (!isLocale(lang)) notFound();

  const tab: Tab = tabRaw === "seeking" ? "seeking" : "available";
  const dict = getDictionary(lang);

  const list = await api.user.mentorList({ kind: tab, limit: 50 });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-6">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {dict.mentor.pageTitle}
        </h1>
        <p className="text-sm text-muted-foreground">
          {dict.mentor.pageSubtitle}
        </p>
      </header>

      <nav className="flex gap-1 border-b border-border">
        <TabLink
          lang={lang}
          tab="available"
          active={tab === "available"}
          label={dict.mentor.tabAvailable}
        />
        <TabLink
          lang={lang}
          tab="seeking"
          active={tab === "seeking"}
          label={dict.mentor.tabSeeking}
        />
      </nav>

      {list.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {tab === "available"
              ? dict.mentor.emptyAvailable
              : dict.mentor.emptySeeking}
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {list.map((u) => (
            <li key={u.id}>
              <Card>
                <CardContent className="py-3">
                  <div className="flex items-start gap-3">
                    <Link
                      href={`/${lang}/u/${u.username}`}
                      className="block size-12 shrink-0"
                    >
                      {u.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={u.image}
                          alt={u.name || u.username}
                          className="size-12 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <span className="size-12 rounded-full bg-foreground/10 flex items-center justify-center text-sm font-semibold uppercase">
                          {(u.name || u.username || "u").slice(0, 2)}
                        </span>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <Link
                          href={`/${lang}/u/${u.username}`}
                          className="font-medium text-foreground hover:underline underline-offset-2"
                        >
                          {u.name || u.username}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          @{u.username}
                        </span>
                        <span className="text-xs text-muted-foreground/70 ml-auto font-mono">
                          {u.karma} {dict.mentor.karmaShort}
                        </span>
                      </div>
                      {u.roles.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {u.roles.map((r) => (
                            <span
                              key={r}
                              className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      )}
                      {u.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {u.bio}
                        </p>
                      )}
                      {u.schools.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {u.schools.map((s) => (
                            <Link
                              key={s.id}
                              href={`/${s.language}/schools/${s.slug}`}
                              className="text-xs rounded-md border border-border px-1.5 py-0.5 hover:bg-muted transition-colors"
                            >
                              {s.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TabLink({
  lang,
  tab,
  active,
  label,
}: {
  lang: string;
  tab: Tab;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={`/${lang}/mentors?tab=${tab}`}
      className={`px-3 py-2 text-sm border-b-2 -mb-px transition-colors ${
        active
          ? "border-foreground text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}
