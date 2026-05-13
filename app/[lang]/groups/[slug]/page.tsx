import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AddGroupPostForm } from "@/components/socionics/add-group-post";
import { GroupJoinButton } from "@/components/socionics/group-join-button";
import { Markdown } from "@/components/socionics/markdown";
import { auth } from "@/lib/auth/auth";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const session = await auth();
  const isAuthed = Boolean(session?.user);

  let data;
  try {
    data = await api.group.getBySlug({ slug, language: lang });
  } catch {
    notFound();
  }

  const { group, owner, members, posts } = data;
  const callbackUrl = `/${lang}/groups/${slug}`;

  return (
    <article className="mx-auto max-w-4xl px-6 py-12 space-y-8">
      <Link
        href={`/${lang}/groups`}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
      >
        {dict.groups.backToList}
      </Link>

      <header className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {group.isPrivate && (
            <Badge variant="outline" className="text-xs font-normal">
              {dict.groups.privateLabel}
            </Badge>
          )}
          {owner && (
            <span className="text-xs text-muted-foreground">
              {dict.groups.ownerLabel}: @{owner.username}
            </span>
          )}
          <span className="ml-auto">
            <GroupJoinButton
              groupId={group.id}
              isMember={group.isMember}
              isOwner={group.isOwner}
              isAuthed={isAuthed}
              loginHref={`/${lang}/login?callbackUrl=${callbackUrl}`}
              dict={dict}
            />
          </span>
        </div>
        <h1 className="font-heading text-4xl font-semibold tracking-tight leading-tight">
          {group.name}
        </h1>
        {group.description && (
          <div className="text-foreground">
            <Markdown>{group.description}</Markdown>
          </div>
        )}
      </header>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            {dict.groups.postsTitle}
          </h2>
          {isAuthed ? (
            group.isMember || group.isOwner ? (
              <AddGroupPostForm
                groupId={group.id}
                groupSlug={group.slug}
                lang={lang}
                dict={dict}
              />
            ) : (
              <p className="text-xs text-muted-foreground">
                {dict.groups.joinToPost}
              </p>
            )
          ) : (
            <Link
              href={`/${lang}/login?callbackUrl=${callbackUrl}`}
              className="text-sm rounded-md border border-border px-3 py-1.5 hover:bg-muted transition-colors"
            >
              {dict.groups.loginToPost}
            </Link>
          )}
        </div>

        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {dict.questions.empty}
          </p>
        ) : (
          <ul className="space-y-2">
            {posts.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/${lang}/groups/${group.slug}/posts/${p.slug}`}
                  className="block rounded-md border border-border px-3 py-2.5 hover:bg-muted/40 transition-colors space-y-1"
                >
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground tabular-nums">
                      {p.score >= 0 ? `+${p.score}` : p.score}
                    </span>
                    <h3 className="text-base font-medium">{p.title}</h3>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {p.commentCount} комм.
                    </span>
                  </div>
                  {p.author && (
                    <p className="text-xs text-muted-foreground">
                      @{p.author.username} ·{" "}
                      {new Date(p.createdAt).toLocaleDateString(
                        lang === "ru" ? "ru-RU" : "en-US",
                        { day: "numeric", month: "short" },
                      )}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {members.length > 0 && (
        <>
          <Separator />
          <section className="space-y-3">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
              {dict.groups.membersTitle} ({members.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => (
                <Link
                  key={m.id}
                  href={`/${lang}/u/${m.username}`}
                  className="inline-flex items-center gap-2 rounded-md border border-border px-2.5 py-1 text-sm hover:bg-muted transition-colors"
                >
                  <span className="size-5 rounded-full bg-foreground/10 flex items-center justify-center text-[10px] font-semibold uppercase">
                    {(m.name || m.username || "u").slice(0, 2)}
                  </span>
                  <span>{m.name || `@${m.username}`}</span>
                  {m.role === "owner" && (
                    <span className="text-[10px] text-muted-foreground/70 font-mono">
                      owner
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      <Card>
        <CardContent className="py-3 text-xs text-muted-foreground space-y-1">
          <p>
            {dict.groups.subtitle.split(".")[0]}. Создана{" "}
            {new Date(group.createdAt).toLocaleDateString(
              lang === "ru" ? "ru-RU" : "en-US",
              { day: "numeric", month: "long", year: "numeric" },
            )}
            .
          </p>
        </CardContent>
      </Card>
    </article>
  );
}
