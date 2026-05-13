import Link from "next/link";
import { notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { GroupPostComments } from "@/components/socionics/group-post-comments";
import { Markdown } from "@/components/socionics/markdown";
import { VoteWidget } from "@/components/socionics/vote-widget";
import { auth } from "@/lib/auth/auth";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

export default async function GroupPostPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string; postSlug: string }>;
}) {
  const { lang, slug, postSlug } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  const session = await auth();
  const isAuthed = Boolean(session?.user);
  const currentUserId =
    (session?.user as { id?: string } | undefined)?.id ?? null;

  let data;
  try {
    data = await api.group.getPost({
      groupSlug: slug,
      postSlug,
      language: lang,
    });
  } catch {
    notFound();
  }

  // Re-fetch the group to know isMember (cheap)
  let groupMeta;
  try {
    groupMeta = await api.group.getBySlug({ slug, language: lang });
  } catch {
    notFound();
  }
  const isMember = groupMeta.group.isMember || groupMeta.group.isOwner;

  const { post, comments, group } = data;
  const callbackUrl = `/${lang}/groups/${slug}/posts/${postSlug}`;

  return (
    <article className="mx-auto max-w-3xl px-6 py-12 space-y-6">
      <Link
        href={`/${lang}/groups/${group.slug}`}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
      >
        {dict.groups.backToGroup} · {group.name}
      </Link>

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <VoteWidget
            targetType="group_post"
            targetId={post.id}
            score={post.score}
            votesUp={post.votesUp}
            votesDown={post.votesDown}
            userVote={post.myVote}
            isAuthed={isAuthed}
            loginHref={`/${lang}/login?callbackUrl=${callbackUrl}`}
          />
        </div>
        <header className="flex-1 min-w-0 space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight leading-tight">
            {post.title}
          </h1>
          <p className="text-xs text-muted-foreground">
            {post.author && (
              <>
                <Link
                  href={`/${lang}/u/${post.author.username}`}
                  className="text-foreground hover:underline underline-offset-2"
                >
                  @{post.author.username}
                </Link>
                {" · "}
              </>
            )}
            {new Date(post.createdAt).toLocaleDateString(
              lang === "ru" ? "ru-RU" : "en-US",
              { day: "numeric", month: "long", year: "numeric" },
            )}
          </p>
        </header>
      </div>

      <section>
        <Markdown>{post.body}</Markdown>
      </section>

      <Separator />

      <GroupPostComments
        groupPostId={post.id}
        comments={comments}
        canComment={isAuthed && isMember}
        isAuthed={isAuthed}
        isMember={isMember}
        currentUserId={currentUserId}
        loginHref={`/${lang}/login?callbackUrl=${callbackUrl}`}
        lang={lang}
        dict={dict}
      />
    </article>
  );
}
