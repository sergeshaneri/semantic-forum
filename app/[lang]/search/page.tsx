"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, use, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc/react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

export default function SearchPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dict = getDictionary(lang as Locale);
  const initialQ = searchParams?.get("q") ?? "";
  const [q, setQ] = useState(initialQ);

  const results = trpc.search.global.useQuery(
    { q: initialQ, language: lang as Locale, limit: 12 },
    { enabled: initialQ.length > 0 },
  );

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const query = q.trim();
    router.push(`/${lang}/search?q=${encodeURIComponent(query)}`);
  }

  const r = results.data;
  const total = r
    ? r.entities.length +
      r.theories.length +
      r.publications.length +
      r.users.length +
      r.questions.length +
      r.polls.length +
      r.groups.length +
      r.groupPosts.length
    : 0;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-6">
      <header className="space-y-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {dict.search.title}
        </h1>
        <form onSubmit={onSubmit}>
          <Input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={dict.search.placeholder}
            autoFocus
          />
        </form>
      </header>

      {initialQ.length === 0 ? null : results.isLoading ? (
        <p className="text-sm text-muted-foreground">…</p>
      ) : total === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {dict.search.noResults}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {r && r.entities.length > 0 && (
            <Section title={dict.search.entitiesSection}>
              {r.entities.map((e) => (
                <ResultRow
                  key={e.id}
                  href={`/${lang}/entities/${e.slug}`}
                  title={e.title}
                  subtitle={e.subtitle}
                  badge={e.kind}
                />
              ))}
            </Section>
          )}
          {r && r.theories.length > 0 && (
            <Section title={dict.search.theoriesSection}>
              {r.theories.map((t) => (
                <ResultRow
                  key={t.id}
                  href={`/${lang}/theories/${t.slug}`}
                  title={t.name}
                  subtitle={t.subtitle}
                  badge={t.isSeed ? "seed" : "theory"}
                />
              ))}
            </Section>
          )}
          {r && r.publications.length > 0 && (
            <Section title={dict.search.publicationsSection}>
              {r.publications.map((p) => (
                <ResultRow
                  key={p.id}
                  href={`/${lang}/u/${p.authorUsername}/p/${p.slug}`}
                  title={p.title}
                  subtitle={`@${p.authorUsername}`}
                  badge={p.kind}
                />
              ))}
            </Section>
          )}
          {r && r.users.length > 0 && (
            <Section title={dict.search.usersSection}>
              {r.users.map((u) => (
                <ResultRow
                  key={u.id}
                  href={`/${lang}/u/${u.username}`}
                  title={u.name || `@${u.username}`}
                  subtitle={u.subtitle ?? `@${u.username}`}
                  badge="user"
                />
              ))}
            </Section>
          )}
          {r && r.questions.length > 0 && (
            <Section title={dict.search.questionsSection}>
              {r.questions.map((q) => (
                <ResultRow
                  key={q.id}
                  href={`/${lang}/questions/${q.slug}`}
                  title={q.title}
                  subtitle={q.subtitle}
                  badge={q.isResolved ? "resolved" : "question"}
                />
              ))}
            </Section>
          )}
          {r && r.polls.length > 0 && (
            <Section title={dict.search.pollsSection}>
              {r.polls.map((p) => (
                <ResultRow
                  key={p.id}
                  href={`/${lang}/polls/${p.slug}`}
                  title={p.question}
                  subtitle={p.subtitle}
                  badge="poll"
                />
              ))}
            </Section>
          )}
          {r && r.groups.length > 0 && (
            <Section title={dict.search.groupsSection}>
              {r.groups.map((g) => (
                <ResultRow
                  key={g.id}
                  href={`/${lang}/groups/${g.slug}`}
                  title={g.name}
                  subtitle={g.subtitle}
                  badge="group"
                />
              ))}
            </Section>
          )}
          {r && r.groupPosts.length > 0 && (
            <Section title={dict.search.groupPostsSection}>
              {r.groupPosts.map((p) => (
                <ResultRow
                  key={p.id}
                  href={`/${lang}/groups/${p.groupSlug}/posts/${p.slug}`}
                  title={p.title}
                  subtitle={p.subtitle}
                  badge="post"
                />
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
        {title}
      </h2>
      <ul className="space-y-1.5">{children}</ul>
    </section>
  );
}

function ResultRow({
  href,
  title,
  subtitle,
  badge,
}: {
  href: string;
  title: string;
  subtitle: string | null | undefined;
  badge: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="block rounded-md border border-border px-3 py-2 hover:bg-muted/50 transition-colors space-y-0.5"
      >
        <div className="flex items-baseline gap-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
            {badge}
          </span>
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {subtitle}
          </p>
        )}
      </Link>
    </li>
  );
}
