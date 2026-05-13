import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AnswerSection } from "@/components/socionics/answer-section";
import { BookmarkButton } from "@/components/socionics/bookmark-button";
import { Markdown } from "@/components/socionics/markdown";
import { auth } from "@/lib/auth/auth";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  let data;
  try {
    data = await api.question.getBySlug({ slug, language: lang });
  } catch {
    notFound();
  }

  const { question, author, answers } = data;
  const session = await auth();
  const isAuthed = Boolean(session?.user);
  const currentUserId =
    (session?.user as { id?: string } | undefined)?.id ?? null;

  return (
    <article className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <Link
        href={`/${lang}/questions`}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
      >
        ← {dict.questions.title}
      </Link>

      <header className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {question.isResolved && (
            <Badge className="text-xs bg-emerald-600 text-white hover:bg-emerald-600">
              {dict.questions.resolved}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {new Date(question.createdAt).toLocaleDateString(
              lang === "ru" ? "ru-RU" : "en-US",
              { day: "numeric", month: "long", year: "numeric" },
            )}
          </span>
          <span className="ml-auto">
            <BookmarkButton
              targetType="entity"
              targetId={question.id}
              isAuthed={isAuthed}
              loginHref={`/${lang}/login?callbackUrl=/${lang}/questions/${question.slug}`}
            />
          </span>
        </div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight leading-tight">
          {question.title}
        </h1>
        {author && (
          <p className="text-sm text-muted-foreground">
            <Link
              href={`/${lang}/u/${author.username}`}
              className="text-foreground font-medium hover:underline underline-offset-2"
            >
              @{author.username}
            </Link>
          </p>
        )}
      </header>

      <section>
        <Markdown>{question.body}</Markdown>
      </section>

      <Separator />

      <AnswerSection
        lang={lang}
        dict={dict}
        questionId={question.id}
        questionAuthorId={question.authorId}
        isResolved={question.isResolved}
        answers={answers}
        isAuthed={isAuthed}
        currentUserId={currentUserId}
      />
    </article>
  );
}
