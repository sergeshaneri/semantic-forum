"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/slug";
import { trpc } from "@/lib/trpc/react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Target =
  | "entity"
  | "interpretation"
  | "theory"
  | "theory_object"
  | "publication"
  | "product"
  | "school"
  | "source";

type Props = {
  targetType: Target;
  targetId: string;
  isAuthed: boolean;
  loginHref: string;
  dict: Dictionary;
  size?: "default" | "sm";
};

export function AddToCollectionMenu({
  targetType,
  targetId,
  isAuthed,
  loginHref,
  dict,
  size = "default",
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();
  const mineQuery = trpc.collection.mine.useQuery(
    { containing: { targetType, targetId } },
    { enabled: open && isAuthed, staleTime: 30_000 },
  );
  const addItem = trpc.collection.addItem.useMutation();
  const removeItem = trpc.collection.removeItem.useMutation();
  const createCollection = trpc.collection.create.useMutation();

  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const collections = mineQuery.data ?? [];
  const savedCount = collections.filter((c) => c.contains).length;

  async function toggleMembership(collectionId: string, isMember: boolean) {
    setError(null);
    try {
      if (isMember) {
        await removeItem.mutateAsync({ collectionId, targetType, targetId });
      } else {
        await addItem.mutateAsync({ collectionId, targetType, targetId });
      }
      await utils.collection.mine.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const name = newName.trim();
    if (name.length < 2) return;
    const baseSlug = slugify(name) || `collection-${Date.now()}`;
    try {
      const r = await createCollection.mutateAsync({
        name,
        slug: baseSlug.slice(0, 200),
        isPublic: true,
      });
      await addItem.mutateAsync({
        collectionId: r.id,
        targetType,
        targetId,
      });
      setNewName("");
      setShowNewForm(false);
      await utils.collection.mine.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  if (!isAuthed) {
    return (
      <button
        type="button"
        onClick={() => router.push(loginHref)}
        title={dict.collections.menu.loginToSave}
        className={cn(
          "rounded p-1 transition-colors text-muted-foreground hover:text-foreground hover:bg-muted",
        )}
      >
        <FolderIcon size={size} active={false} />
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={dict.collections.menu.buttonTitle}
        className={cn(
          "rounded p-1 transition-colors",
          savedCount > 0
            ? "text-sky-600 hover:bg-muted"
            : "text-muted-foreground hover:text-sky-600 hover:bg-muted",
        )}
      >
        <FolderIcon size={size} active={savedCount > 0} />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-1 w-72 rounded-md border border-border bg-background shadow-md p-2 text-sm">
          <div className="px-2 py-1 text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {dict.collections.menu.heading}
            {savedCount > 0 && (
              <span className="ml-1 text-foreground/70 normal-case tracking-normal font-normal">
                ({dict.collections.menu.savedInCount} {savedCount})
              </span>
            )}
          </div>

          {mineQuery.isLoading ? (
            <div className="px-2 py-2 text-muted-foreground">…</div>
          ) : collections.length === 0 && !showNewForm ? (
            <div className="px-2 py-2 text-muted-foreground">
              {dict.collections.menu.empty}
            </div>
          ) : (
            <ul className="max-h-56 overflow-y-auto">
              {collections.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => toggleMembership(c.id, c.contains)}
                    disabled={addItem.isPending || removeItem.isPending}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-muted flex items-center gap-2 disabled:opacity-50"
                  >
                    <span
                      className={cn(
                        "inline-flex size-4 items-center justify-center rounded border",
                        c.contains
                          ? "bg-foreground border-foreground text-background"
                          : "border-border",
                      )}
                    >
                      {c.contains && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                    <span className="truncate flex-1">{c.name}</span>
                    {!c.isPublic && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {dict.collections.privateLabel}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-1 border-t border-border pt-1">
            {showNewForm ? (
              <form onSubmit={onCreate} className="px-2 py-1 space-y-1.5">
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={dict.collections.menu.newPlaceholder}
                  maxLength={200}
                  className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm outline-none focus:border-foreground/60"
                />
                <div className="flex gap-1.5 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewForm(false);
                      setNewName("");
                      setError(null);
                    }}
                    className="text-xs rounded px-2 py-1 hover:bg-muted text-muted-foreground"
                  >
                    {dict.addInterpretation.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={
                      createCollection.isPending ||
                      newName.trim().length < 2
                    }
                    className="text-xs rounded px-2 py-1 bg-foreground text-background hover:opacity-90 disabled:opacity-50"
                  >
                    {createCollection.isPending
                      ? "…"
                      : dict.collections.menu.createButton}
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowNewForm(true)}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                {dict.collections.menu.newCollection}
              </button>
            )}
          </div>

          {error && (
            <p className="px-2 pt-1 text-xs text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function FolderIcon({
  size,
  active,
}: {
  size: "default" | "sm";
  active: boolean;
}) {
  const sz = size === "sm" ? "size-3.5" : "size-4";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={sz}
    >
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </svg>
  );
}
