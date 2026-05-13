"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc/react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Comment = {
  id: string;
  body: string;
  createdAt: Date;
  authorId: string | null;
  author: { id: string; username: string; name: string } | null;
};

type Props = {
  groupPostId: string;
  comments: Comment[];
  canComment: boolean;
  isAuthed: boolean;
  isMember: boolean;
  currentUserId: string | null;
  loginHref: string;
  lang: Locale;
  dict: Dictionary;
};

export function GroupPostComments({
  groupPostId,
  comments,
  canComment,
  isAuthed,
  isMember,
  currentUserId,
  loginHref,
  lang,
  dict,
}: Props) {
  const router = useRouter();
  const add = trpc.group.addComment.useMutation();
  const remove = trpc.group.deleteComment.useMutation();

  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const text = body.trim();
    if (!text) return;
    try {
      await add.mutateAsync({ groupPostId, body: text });
      setBody("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  async function onDelete(id: string) {
    setError(null);
    try {
      await remove.mutateAsync({ id });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
        {dict.groups.addCommentTitle} ({comments.length})
      </h2>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">{dict.groups.noComments}</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => {
            const isOwner =
              currentUserId !== null && currentUserId === c.authorId;
            return (
              <li
                key={c.id}
                className="border-l-2 border-border/60 pl-3 sm:pl-4 space-y-1"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {c.author && (
                    <Link
                      href={`/${lang}/u/${c.author.username}`}
                      className="font-medium text-foreground hover:underline underline-offset-2"
                    >
                      @{c.author.username}
                    </Link>
                  )}
                  <span>·</span>
                  <span>
                    {new Date(c.createdAt).toLocaleDateString(
                      lang === "ru" ? "ru-RU" : "en-US",
                      { day: "numeric", month: "short" },
                    )}
                  </span>
                  {isOwner && (
                    <ConfirmDialog
                      title={dict.actions.confirmTitle}
                      description={dict.actions.confirmDelete}
                      confirmLabel={dict.actions.delete}
                      cancelLabel={dict.actions.cancel}
                      onConfirm={() => onDelete(c.id)}
                      trigger={(open) => (
                        <button
                          type="button"
                          onClick={open}
                          className="ml-auto text-[11px] hover:text-rose-600 transition-colors"
                        >
                          {dict.actions.delete}
                        </button>
                      )}
                    />
                  )}
                </div>
                <p className="text-sm text-foreground/90 whitespace-pre-line">
                  {c.body}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      {canComment ? (
        <form onSubmit={onSubmit} className="space-y-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={dict.groups.commentPlaceholder}
            rows={3}
            minLength={1}
            maxLength={4000}
          />
          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={add.isPending || body.trim().length === 0}
              className="text-sm rounded-md bg-foreground text-background px-3 py-1.5 hover:opacity-90 disabled:opacity-50"
            >
              {add.isPending ? "…" : dict.groups.publishComment}
            </button>
          </div>
        </form>
      ) : !isAuthed ? (
        <Link
          href={loginHref}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {dict.groups.loginToPost}
        </Link>
      ) : !isMember ? (
        <p className="text-xs text-muted-foreground">{dict.groups.joinToPost}</p>
      ) : null}
    </section>
  );
}
