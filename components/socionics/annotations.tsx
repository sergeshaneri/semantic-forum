"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { trpc } from "@/lib/trpc/react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Annotation = {
  id: string;
  anchorText: string;
  startOffset: number | null;
  endOffset: number | null;
  body: string;
  createdAt: Date;
  authorId: string | null;
  author: { id: string; username: string; name: string } | null;
};

type Props = {
  entityId: string;
  initial: Annotation[];
  isAuthed: boolean;
  currentUserId: string | null;
  loginHref: string;
  lang: Locale;
  dict: Dictionary;
};

export function Annotations({
  entityId,
  initial,
  isAuthed,
  currentUserId,
  loginHref,
  lang,
  dict,
}: Props) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const list = trpc.annotation.list.useQuery(
    { entityId },
    { initialData: initial, staleTime: 30_000 },
  );
  const create = trpc.annotation.create.useMutation();
  const remove = trpc.annotation.delete.useMutation();

  const [draftAnchor, setDraftAnchor] = useState<string>("");
  const [draftOffsets, setDraftOffsets] = useState<{
    start: number | null;
    end: number | null;
  } | null>(null);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  function captureSelection() {
    if (typeof window === "undefined") return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      setError(dict.annotations.selectFirst);
      return;
    }
    const text = sel.toString().trim();
    if (text.length === 0) {
      setError(dict.annotations.selectFirst);
      return;
    }
    setError(null);
    setDraftAnchor(text.slice(0, 1000));
    // Try to capture offsets relative to the entity body container.
    // The container is marked with [data-annotation-source="true"].
    let startOffset: number | null = null;
    let endOffset: number | null = null;
    try {
      const range = sel.getRangeAt(0);
      const container = (range.commonAncestorContainer as Element)?.closest?.(
        "[data-annotation-source='true']",
      ) ?? document.querySelector("[data-annotation-source='true']");
      if (container) {
        const fullText = container.textContent ?? "";
        const idx = fullText.indexOf(text);
        if (idx >= 0) {
          startOffset = idx;
          endOffset = idx + text.length;
        }
      }
    } catch {
      // ignore
    }
    setDraftOffsets({ start: startOffset, end: endOffset });
    setFormOpen(true);
    sel.removeAllRanges();
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmed = body.trim();
    if (!trimmed || !draftAnchor) return;
    try {
      await create.mutateAsync({
        entityId,
        anchorText: draftAnchor,
        startOffset: draftOffsets?.start ?? undefined,
        endOffset: draftOffsets?.end ?? undefined,
        body: trimmed,
      });
      setBody("");
      setDraftAnchor("");
      setDraftOffsets(null);
      setFormOpen(false);
      await utils.annotation.list.invalidate({ entityId });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  async function onDelete(id: string) {
    try {
      await remove.mutateAsync({ id });
      await utils.annotation.list.invalidate({ entityId });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  function highlightInText(text: string) {
    if (typeof window === "undefined") return;
    const container = document.querySelector(
      "[data-annotation-source='true']",
    ) as HTMLElement | null;
    if (!container) return;
    container.scrollIntoView({ behavior: "smooth", block: "start" });
    // Quick visual flash by setting URL hash w/ text fragment — modern browsers support it.
    const encoded = encodeURIComponent(text.slice(0, 80));
    const newUrl = `${window.location.pathname}#:~:text=${encoded}`;
    window.history.replaceState(null, "", newUrl);
    // Also try to select the text manually
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const idx = (node.nodeValue ?? "").indexOf(text);
      if (idx >= 0) {
        const range = document.createRange();
        range.setStart(node, idx);
        range.setEnd(node, idx + text.length);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        return;
      }
    }
  }

  const annotations = list.data ?? initial;

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          {dict.annotations.title}
        </h2>
        {isAuthed ? (
          !formOpen && (
            <button
              type="button"
              onClick={captureSelection}
              disabled={create.isPending}
              className="text-sm rounded-md border border-border px-3 py-1.5 hover:bg-muted transition-colors disabled:opacity-50"
            >
              + {dict.annotations.addButton}
            </button>
          )
        ) : (
          <Link
            href={loginHref}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {dict.addInterpretation.loginToAdd}
          </Link>
        )}
      </div>

      <p className="text-xs text-muted-foreground">{dict.annotations.helper}</p>

      {formOpen && (
        <form
          onSubmit={onSubmit}
          className="rounded-md border border-border bg-muted/30 p-3 space-y-3"
        >
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
              {dict.annotations.quoteLabel}
            </p>
            <blockquote className="border-l-2 border-foreground/30 pl-3 text-sm italic text-foreground/80">
              "{draftAnchor}"
            </blockquote>
          </div>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={dict.annotations.bodyPlaceholder}
            rows={4}
            minLength={1}
            maxLength={5000}
            required
          />
          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
          )}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setFormOpen(false);
                setDraftAnchor("");
                setBody("");
              }}
              disabled={create.isPending}
              className="text-sm rounded-md border border-border px-3 py-1.5 hover:bg-muted transition-colors disabled:opacity-50"
            >
              {dict.actions.cancel}
            </button>
            <button
              type="submit"
              disabled={create.isPending || body.trim().length === 0}
              className="text-sm rounded-md bg-foreground text-background px-3 py-1.5 hover:opacity-90 disabled:opacity-50"
            >
              {create.isPending ? "…" : dict.annotations.publish}
            </button>
          </div>
        </form>
      )}

      {!formOpen && error && (
        <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
      )}

      {annotations.length === 0 ? (
        <p className="text-sm text-muted-foreground">{dict.annotations.empty}</p>
      ) : (
        <ul className="space-y-3">
          {annotations.map((a) => {
            const isOwner =
              currentUserId !== null && currentUserId === a.authorId;
            return (
              <li
                key={a.id}
                className="rounded-md border border-border bg-card p-3 space-y-2"
              >
                <blockquote className="border-l-2 border-foreground/30 pl-3 text-sm italic text-foreground/80">
                  "{a.anchorText}"
                </blockquote>
                <p className="text-sm whitespace-pre-line">{a.body}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                  {a.author && (
                    <>
                      <Link
                        href={`/${lang}/u/${a.author.username}`}
                        className="font-medium text-foreground hover:underline underline-offset-2"
                      >
                        @{a.author.username}
                      </Link>
                      <span>·</span>
                    </>
                  )}
                  <span>
                    {new Date(a.createdAt).toLocaleDateString(
                      lang === "ru" ? "ru-RU" : "en-US",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => highlightInText(a.anchorText)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {dict.annotations.findInText}
                  </button>
                  {isOwner && (
                    <ConfirmDialog
                      title={dict.actions.confirmTitle}
                      description={dict.actions.confirmDelete}
                      confirmLabel={dict.actions.delete}
                      cancelLabel={dict.actions.cancel}
                      onConfirm={() => onDelete(a.id)}
                      trigger={(open) => (
                        <button
                          type="button"
                          onClick={open}
                          className="ml-auto text-muted-foreground hover:text-rose-600 transition-colors"
                        >
                          {dict.actions.delete}
                        </button>
                      )}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
