"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { diffLines } from "@/lib/diff";
import { trpc } from "@/lib/trpc/react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Kind = "interpretation" | "publication";

type Props = {
  kind: Kind;
  id: string;
  currentBody: string;
  currentTitle?: string;
  dict: Dictionary;
};

export function RevisionHistory({
  kind,
  id,
  currentBody,
  currentTitle,
  dict,
}: Props) {
  const [open, setOpen] = useState(false);
  const interpretationHistory = trpc.interpretation.history.useQuery(
    { id },
    { enabled: open && kind === "interpretation", staleTime: 30_000 },
  );
  const publicationHistory = trpc.publication.history.useQuery(
    { id },
    { enabled: open && kind === "publication", staleTime: 30_000 },
  );
  const data =
    kind === "interpretation"
      ? interpretationHistory.data
      : publicationHistory.data;
  const isLoading =
    kind === "interpretation"
      ? interpretationHistory.isLoading
      : publicationHistory.isLoading;

  const [selectedId, setSelectedId] = useState<string | null>(null);

  type RevisionLike = {
    id: string;
    body: string;
    createdAt: Date;
    editor: { username: string; name: string } | null;
    title?: string;
  };
  const revisions: RevisionLike[] = useMemo(() => {
    if (!data) return [];
    return data as RevisionLike[];
  }, [data]);

  const selected = revisions.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2 decoration-dotted"
      >
        {dict.versioning.history}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {isLoading ? (
            <p className="text-xs text-muted-foreground">…</p>
          ) : revisions.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              {dict.versioning.historyEmpty}
            </p>
          ) : (
            <div className="space-y-3">
              <ul className="space-y-1.5">
                {revisions.map((r, idx) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedId((cur) => (cur === r.id ? null : r.id))
                      }
                      className={`w-full text-left rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                        selectedId === r.id
                          ? "border-foreground bg-muted"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono uppercase tracking-wider text-muted-foreground">
                          {dict.versioning.revisionLabel} #{revisions.length - idx}
                        </span>
                        <span className="text-muted-foreground">
                          {new Date(r.createdAt).toLocaleString()}
                        </span>
                        {r.editor && (
                          <span className="text-muted-foreground ml-auto">
                            {dict.versioning.by} @{r.editor.username}
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>

              {selected && (
                <Card>
                  <CardContent className="py-3 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                      <span className="font-mono uppercase tracking-wider">
                        {dict.versioning.diffBetween}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedId(null)}
                        className="ml-auto"
                      >
                        ×
                      </Button>
                    </div>
                    {kind === "publication" &&
                      currentTitle &&
                      selected.title &&
                      currentTitle !== selected.title && (
                        <DiffBlock
                          oldText={selected.title}
                          newText={currentTitle}
                          dict={dict}
                          label="title"
                        />
                      )}
                    <DiffBlock
                      oldText={selected.body}
                      newText={currentBody}
                      dict={dict}
                      label="body"
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DiffBlock({
  oldText,
  newText,
  dict,
  label,
}: {
  oldText: string;
  newText: string;
  dict: Dictionary;
  label: string;
}) {
  const parts = useMemo(() => diffLines(oldText, newText), [oldText, newText]);
  const hasChanges = parts.some((p) => p.kind !== "same");
  return (
    <div className="space-y-1">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
        {label}
      </div>
      {hasChanges ? (
        <pre className="text-xs whitespace-pre-wrap font-mono rounded-md border border-border bg-muted/30 p-2 leading-relaxed">
          {parts.map((p, idx) => (
            <span
              key={idx}
              className={
                p.kind === "add"
                  ? "block bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  : p.kind === "del"
                    ? "block bg-rose-500/15 text-rose-700 dark:text-rose-300 line-through opacity-80"
                    : "block"
              }
            >
              {p.kind === "add" ? "+ " : p.kind === "del" ? "− " : "  "}
              {p.text || " "}
            </span>
          ))}
        </pre>
      ) : (
        <p className="text-xs text-muted-foreground">{dict.versioning.noDiff}</p>
      )}
    </div>
  );
}
