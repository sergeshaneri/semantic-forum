import Link from "next/link";
import { notFound } from "next/navigation";
import { PollVoter } from "@/components/socionics/poll-voter";
import { auth } from "@/lib/auth/auth";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

export default async function PollPage({
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
    data = await api.poll.getBySlug({ slug, language: lang });
  } catch {
    notFound();
  }

  const { poll, creator } = data;

  return (
    <article className="mx-auto max-w-2xl px-6 py-12 space-y-6">
      <Link
        href={`/${lang}/polls`}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
      >
        {dict.polls.backToList}
      </Link>

      <header className="space-y-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight leading-tight">
          {poll.question}
        </h1>
        {poll.description && (
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {poll.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {creator && (
            <>
              {dict.polls.by}{" "}
              <Link
                href={`/${lang}/u/${creator.username}`}
                className="text-foreground hover:underline underline-offset-2"
              >
                @{creator.username}
              </Link>
              {" · "}
            </>
          )}
          {new Date(poll.createdAt).toLocaleDateString(
            lang === "ru" ? "ru-RU" : "en-US",
            { day: "numeric", month: "long", year: "numeric" },
          )}
        </p>
      </header>

      <PollVoter
        pollId={poll.id}
        options={poll.options}
        tallies={poll.tallies}
        totalVotes={poll.totalVotes}
        myVote={poll.myVote}
        isClosed={poll.isClosed}
        isAuthed={isAuthed}
        loginHref={`/${lang}/login?callbackUrl=/${lang}/polls/${poll.slug}`}
        dict={dict}
      />
    </article>
  );
}
