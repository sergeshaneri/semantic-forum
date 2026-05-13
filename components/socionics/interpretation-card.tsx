"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AddToCollectionMenu } from "@/components/socionics/add-to-collection-menu";
import { BookmarkButton } from "@/components/socionics/bookmark-button";
import { Markdown } from "@/components/socionics/markdown";
import { VoteWidget } from "@/components/socionics/vote-widget";
import { StanceBadge, type Stance } from "@/components/socionics/stance-badge";
import { trpc } from "@/lib/trpc/react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Author = { username: string; name: string; karma: number } | null;
type CommentAuthor = { username: string; name: string } | null;
type Theory = { id?: string; name: string; slug: string } | null;
type TheoryObject = {
  id?: string;
  name: string;
  slug: string;
  metadata: Record<string, unknown> | null | undefined;
} | null;

type Comment = {
  id: string;
  body: string;
  stance: Stance;
  votesUp: number;
  votesDown: number;
  userVote: 1 | -1 | 0;
  authorId: string | null;
  author: CommentAuthor;
};

type Props = {
  lang: Locale;
  dict: Dictionary;
  isAuthed: boolean;
  currentUserId: string | null;
  interpretation: {
    id: string;
    body: string;
    score: number;
    votesUp: number;
    votesDown: number;
    userVote: 1 | -1 | 0;
    authorId: string | null;
    theory: Theory;
    theoryObject: TheoryObject;
    author: Author;
    comments: Comment[];
  };
};

function getSymbol(metadata: Record<string, unknown> | null | undefined) {
  if (metadata && typeof metadata === "object" && "symbol" in metadata) {
    const v = (metadata as { symbol?: unknown }).symbol;
    return typeof v === "string" ? v : null;
  }
  return null;
}

export function InterpretationCard({
  lang,
  dict,
  isAuthed,
  currentUserId,
  interpretation: i,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [replying, setReplying] = useState(false);

  const symbol = getSymbol(i.theoryObject?.metadata);
  const loginHref = `/${lang}/login`;
  const isOwner = currentUserId !== null && currentUserId === i.authorId;

  const stanceLabel = (s: Stance) =>
    s === "pro"
      ? dict.interpretation.stancePro
      : s === "contra"
        ? dict.interpretation.stanceContra
        : dict.interpretation.stanceNeutral;

  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <div className="flex-shrink-0 border-r border-border px-3 py-5 flex items-start">
          <VoteWidget
            targetType="interpretation"
            targetId={i.id}
            score={i.score}
            votesUp={i.votesUp}
            votesDown={i.votesDown}
            userVote={i.userVote}
            isAuthed={isAuthed}
            loginHref={loginHref}
          />
        </div>
        <div className="flex-1 min-w-0">
          <CardContent className="space-y-4 pt-5">
            <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
              {i.author && (
                <>
                  <Link
                    href={`/${lang}/u/${i.author.username}`}
                    className="text-foreground font-medium hover:underline underline-offset-2"
                  >
                    @{i.author.username}
                  </Link>
                  <span className="text-muted-foreground/60">
                    · {i.author.karma} {dict.interpretation.karma}
                  </span>
                </>
              )}
              <span className="text-muted-foreground/40">·</span>
              {i.theoryObject && (
                <Link
                  href={
                    i.theory
                      ? `/${lang}/theories/${i.theory.slug}/objects/${i.theoryObject.slug}`
                      : "#"
                  }
                  className="font-mono inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-foreground/5 hover:bg-foreground/10 transition-colors"
                >
                  {symbol && (
                    <span className="font-semibold text-foreground">
                      {symbol}
                    </span>
                  )}
                  <span>{i.theoryObject.name}</span>
                </Link>
              )}
              {i.theory && (
                <>
                  <span className="text-muted-foreground/40">
                    {dict.interpretation.inTheory}
                  </span>
                  <Link
                    href={`/${lang}/theories/${i.theory.slug}`}
                    className="hover:text-foreground underline underline-offset-2 decoration-1 decoration-muted-foreground/40"
                  >
                    {i.theory.name}
                  </Link>
                </>
              )}
              <span className="ml-auto inline-flex items-center gap-2">
                <BookmarkButton
                  targetType="interpretation"
                  targetId={i.id}
                  isAuthed={isAuthed}
                  loginHref={loginHref}
                  size="sm"
                />
                <AddToCollectionMenu
                  targetType="interpretation"
                  targetId={i.id}
                  isAuthed={isAuthed}
                  loginHref={loginHref}
                  dict={dict}
                  size="sm"
                />
                {isOwner && !editing && (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="text-xs hover:text-foreground transition-colors"
                    >
                      {dict.actions.edit}
                    </button>
                    <DeleteInterpretation
                      id={i.id}
                      dict={dict}
                      onDeleted={() => router.refresh()}
                    />
                  </>
                )}
              </span>
            </div>

            {editing ? (
              <EditInterpretation
                interpretation={i}
                lang={lang}
                dict={dict}
                onCancel={() => setEditing(false)}
                onSaved={() => {
                  setEditing(false);
                  router.refresh();
                }}
              />
            ) : (
              <div className="text-[15px]">
                <Markdown>{i.body}</Markdown>
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t border-border/60 bg-muted/30 flex-col items-stretch gap-3 py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground/80 font-medium">
                {i.comments.length} {dict.interpretation.comments}
              </div>
              {isAuthed ? (
                !replying && (
                  <button
                    type="button"
                    onClick={() => setReplying(true)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    + {dict.interpretation.addComment}
                  </button>
                )
              ) : (
                <Link
                  href={loginHref}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {dict.interpretation.loginToReply}
                </Link>
              )}
            </div>

            {replying && (
              <AddCommentForm
                interpretationId={i.id}
                dict={dict}
                onCancel={() => setReplying(false)}
                onCreated={() => {
                  setReplying(false);
                  router.refresh();
                }}
              />
            )}

            {i.comments.length > 0 && (
              <ul className="space-y-3">
                {i.comments.map((c) => (
                  <CommentItem
                    key={c.id}
                    comment={c}
                    lang={lang}
                    dict={dict}
                    isAuthed={isAuthed}
                    currentUserId={currentUserId}
                    loginHref={loginHref}
                    stanceLabel={stanceLabel}
                    onMutated={() => router.refresh()}
                  />
                ))}
              </ul>
            )}
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}

function CommentItem({
  comment: c,
  lang,
  dict,
  isAuthed,
  currentUserId,
  loginHref,
  stanceLabel,
  onMutated,
}: {
  comment: Comment;
  lang: Locale;
  dict: Dictionary;
  isAuthed: boolean;
  currentUserId: string | null;
  loginHref: string;
  stanceLabel: (s: Stance) => string;
  onMutated: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const isOwner = currentUserId !== null && currentUserId === c.authorId;
  return (
    <li className="flex items-start gap-3 text-sm leading-relaxed">
      <VoteWidget
        targetType="comment"
        targetId={c.id}
        score={c.votesUp - c.votesDown}
        votesUp={c.votesUp}
        votesDown={c.votesDown}
        userVote={c.userVote}
        isAuthed={isAuthed}
        loginHref={loginHref}
        size="sm"
        className="flex-shrink-0 pt-0.5"
      />
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {c.author && (
            <Link
              href={`/${lang}/u/${c.author.username}`}
              className="font-medium text-foreground hover:underline underline-offset-2"
            >
              @{c.author.username}
            </Link>
          )}
          <StanceBadge stance={c.stance} label={stanceLabel(c.stance)} />
          {isOwner && !editing && (
            <span className="ml-auto inline-flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-[11px] hover:text-foreground transition-colors"
              >
                {dict.actions.edit}
              </button>
              <DeleteComment
                id={c.id}
                dict={dict}
                onDeleted={onMutated}
              />
            </span>
          )}
        </div>
        {editing ? (
          <EditCommentForm
            comment={c}
            dict={dict}
            onCancel={() => setEditing(false)}
            onSaved={() => {
              setEditing(false);
              onMutated();
            }}
          />
        ) : (
          <p className="text-foreground/90 whitespace-pre-line">{c.body}</p>
        )}
      </div>
    </li>
  );
}

function AddCommentForm({
  interpretationId,
  dict,
  onCancel,
  onCreated,
}: {
  interpretationId: string;
  dict: Dictionary;
  onCancel: () => void;
  onCreated: () => void;
}) {
  const create = trpc.comment.create.useMutation();
  const [body, setBody] = useState("");
  const [stance, setStance] = useState<Stance>("neutral");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({ interpretationId, body, stance });
      setBody("");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <StanceSelect value={stance} onChange={setStance} dict={dict} />
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={dict.comment.bodyPlaceholder}
        rows={3}
        minLength={2}
        maxLength={2000}
        required
      />
      {error && (
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
      )}
      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={create.isPending}
        >
          {dict.addInterpretation.cancel}
        </Button>
        <Button type="submit" size="sm" disabled={create.isPending || !body}>
          {create.isPending ? "..." : dict.comment.publish}
        </Button>
      </div>
    </form>
  );
}

function EditCommentForm({
  comment,
  dict,
  onCancel,
  onSaved,
}: {
  comment: Comment;
  dict: Dictionary;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const update = trpc.comment.update.useMutation();
  const [body, setBody] = useState(comment.body);
  const [stance, setStance] = useState<Stance>(comment.stance);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      await update.mutateAsync({ id: comment.id, body, stance });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <StanceSelect value={stance} onChange={setStance} dict={dict} />
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        minLength={2}
        maxLength={2000}
        required
      />
      {error && (
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
      )}
      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={update.isPending}
        >
          {dict.addInterpretation.cancel}
        </Button>
        <Button type="submit" size="sm" disabled={update.isPending}>
          {update.isPending ? "..." : dict.actions.save}
        </Button>
      </div>
    </form>
  );
}

function StanceSelect({
  value,
  onChange,
  dict,
}: {
  value: Stance;
  onChange: (s: Stance) => void;
  dict: Dictionary;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {(["pro", "contra", "neutral"] as const).map((s) => (
        <button
          type="button"
          key={s}
          onClick={() => onChange(s)}
          className={`text-xs rounded-md border px-2 py-1 transition-colors ${
            value === s
              ? "border-foreground bg-foreground text-background"
              : "border-border hover:bg-muted"
          }`}
        >
          {s === "pro"
            ? dict.interpretation.stancePro
            : s === "contra"
              ? dict.interpretation.stanceContra
              : dict.interpretation.stanceNeutral}
        </button>
      ))}
    </div>
  );
}

function DeleteComment({
  id,
  dict,
  onDeleted,
}: {
  id: string;
  dict: Dictionary;
  onDeleted: () => void;
}) {
  const del = trpc.comment.delete.useMutation();
  return (
    <button
      type="button"
      onClick={async () => {
        if (!confirm(dict.actions.confirmDelete)) return;
        await del.mutateAsync({ id });
        onDeleted();
      }}
      disabled={del.isPending}
      className="text-[11px] hover:text-rose-600 transition-colors"
    >
      {dict.actions.delete}
    </button>
  );
}

function DeleteInterpretation({
  id,
  dict,
  onDeleted,
}: {
  id: string;
  dict: Dictionary;
  onDeleted: () => void;
}) {
  const del = trpc.interpretation.delete.useMutation();
  return (
    <button
      type="button"
      onClick={async () => {
        if (!confirm(dict.actions.confirmDeleteInterpretation)) return;
        await del.mutateAsync({ id });
        onDeleted();
      }}
      disabled={del.isPending}
      className="text-xs hover:text-rose-600 transition-colors"
    >
      {dict.actions.delete}
    </button>
  );
}

function EditInterpretation({
  interpretation: i,
  lang,
  dict,
  onCancel,
  onSaved,
}: {
  interpretation: Props["interpretation"];
  lang: Locale;
  dict: Dictionary;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const update = trpc.interpretation.update.useMutation();
  const theoriesQuery = trpc.theory.list.useQuery({ language: lang });
  const [theoryId, setTheoryId] = useState(i.theory?.id ?? "");
  const [theoryObjectId, setTheoryObjectId] = useState(i.theoryObject?.id ?? "");
  const [body, setBody] = useState(i.body);
  const [error, setError] = useState<string | null>(null);
  const objectsQuery = trpc.theory.getObjects.useQuery(
    { theoryId },
    { enabled: theoryId.length > 0 },
  );
  const objects = useMemo(() => {
    const list = objectsQuery.data ?? [];
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [objectsQuery.data]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!theoryId || !theoryObjectId) {
      setError(dict.addInterpretation.selectBoth);
      return;
    }
    try {
      await update.mutateAsync({
        id: i.id,
        theoryId,
        theoryObjectId,
        body,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor={`theory-${i.id}`}>
            {dict.addInterpretation.theory}
          </Label>
          <select
            id={`theory-${i.id}`}
            value={theoryId}
            onChange={(e) => {
              setTheoryId(e.target.value);
              setTheoryObjectId("");
            }}
            className="w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-sm"
            required
          >
            <option value="">— {dict.addInterpretation.selectTheory} —</option>
            {(theoriesQuery.data ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor={`object-${i.id}`}>
            {dict.addInterpretation.theoryObject}
          </Label>
          <select
            id={`object-${i.id}`}
            value={theoryObjectId}
            onChange={(e) => setTheoryObjectId(e.target.value)}
            disabled={!theoryId}
            className="w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-sm disabled:opacity-50"
            required
          >
            <option value="">— {dict.addInterpretation.selectObject} —</option>
            {objects.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={5}
        minLength={20}
        maxLength={5000}
        required
      />
      {error && (
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
      )}
      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={update.isPending}
        >
          {dict.addInterpretation.cancel}
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={update.isPending || !theoryId || !theoryObjectId}
        >
          {update.isPending ? "..." : dict.actions.save}
        </Button>
      </div>
    </form>
  );
}
