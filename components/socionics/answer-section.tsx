"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/components/socionics/markdown";
import { VoteWidget } from "@/components/socionics/vote-widget";
import { trpc } from "@/lib/trpc/react";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Answer = {
  id: string;
  body: string;
  isAccepted: boolean;
  votesUp: number;
  votesDown: number;
  score: number;
  authorId: string | null;
  author: { id: string; username: string; name: string } | null;
};

type Props = {
  lang: Locale;
  dict: Dictionary;
  questionId: string;
  questionAuthorId: string | null;
  isResolved: boolean;
  answers: Answer[];
  isAuthed: boolean;
  currentUserId: string | null;
};

export function AnswerSection({
  lang,
  dict,
  questionId,
  questionAuthorId,
  isResolved,
  answers,
  isAuthed,
  currentUserId,
}: Props) {
  const router = useRouter();
  const create = trpc.answer.create.useMutation();
  const acceptM = trpc.answer.accept.useMutation();
  const deleteM = trpc.answer.delete.useMutation();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const isQuestionAuthor =
    currentUserId !== null && currentUserId === questionAuthorId;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({ questionId, body });
      setBody("");
      setShowForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          {answers.length} {dict.questions.answersWord}
        </h2>
        {isAuthed ? (
          !showForm && (
            <Button size="sm" onClick={() => setShowForm(true)}>
              + {dict.questions.answerButton}
            </Button>
          )
        ) : (
          <Link
            href={`/${lang}/login`}
            className="text-sm rounded-md border border-border px-3 py-1.5 hover:bg-muted transition-colors"
          >
            {dict.questions.loginToAnswer}
          </Link>
        )}
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-5">
            <form onSubmit={onSubmit} className="space-y-3">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                minLength={20}
                maxLength={10000}
                placeholder={dict.questions.answerPlaceholder}
                required
              />
              {error && (
                <p className="text-sm text-rose-600 dark:text-rose-400">
                  {error}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowForm(false)}
                  disabled={create.isPending}
                >
                  {dict.addInterpretation.cancel}
                </Button>
                <Button type="submit" size="sm" disabled={create.isPending}>
                  {create.isPending ? "..." : dict.questions.publishAnswer}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {answers.length > 0 && (
        <ul className="space-y-3">
          {answers.map((a) => {
            const isOwner =
              currentUserId !== null && currentUserId === a.authorId;
            return (
              <li key={a.id}>
                <Card
                  className={cn(
                    "overflow-hidden",
                    a.isAccepted && "border-emerald-500/40",
                  )}
                >
                  <div className="flex">
                    <div className="flex-shrink-0 border-r border-border px-3 py-5 flex flex-col items-center gap-2">
                      <VoteWidget
                        targetType="answer"
                        targetId={a.id}
                        score={a.score}
                        votesUp={a.votesUp}
                        votesDown={a.votesDown}
                        userVote={0}
                        isAuthed={isAuthed}
                        loginHref={`/${lang}/login`}
                      />
                      {a.isAccepted && (
                        <span
                          title={dict.questions.acceptedLabel}
                          className="text-emerald-600"
                        >
                          ✓
                        </span>
                      )}
                    </div>
                    <CardContent className="flex-1 pt-5 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                        {a.author && (
                          <Link
                            href={`/${lang}/u/${a.author.username}`}
                            className="text-foreground font-medium hover:underline underline-offset-2"
                          >
                            @{a.author.username}
                          </Link>
                        )}
                        {a.isAccepted && (
                          <span className="text-xs rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-2 py-0.5">
                            ✓ {dict.questions.acceptedLabel}
                          </span>
                        )}
                        <span className="ml-auto flex items-center gap-2">
                          {isQuestionAuthor && !a.isAccepted && !isResolved && (
                            <button
                              type="button"
                              onClick={() =>
                                acceptM
                                  .mutateAsync({ id: a.id })
                                  .then(() => router.refresh())
                              }
                              disabled={acceptM.isPending}
                              className="text-xs hover:text-emerald-600 transition-colors"
                            >
                              {dict.questions.acceptButton}
                            </button>
                          )}
                          {isOwner && (
                            <button
                              type="button"
                              onClick={async () => {
                                if (!confirm(dict.actions.confirmDelete))
                                  return;
                                await deleteM.mutateAsync({ id: a.id });
                                router.refresh();
                              }}
                              disabled={deleteM.isPending}
                              className="text-xs hover:text-rose-600 transition-colors"
                            >
                              {dict.actions.delete}
                            </button>
                          )}
                        </span>
                      </div>
                      <Markdown>{a.body}</Markdown>
                    </CardContent>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
