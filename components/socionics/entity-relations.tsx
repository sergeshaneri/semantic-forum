"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Kind =
  | "related"
  | "synonym"
  | "antonym"
  | "part_of"
  | "contains"
  | "example_of"
  | "instance_of"
  | "causes"
  | "precedes"
  | "custom";

const kinds: Kind[] = [
  "related",
  "synonym",
  "antonym",
  "part_of",
  "contains",
  "example_of",
  "instance_of",
  "causes",
  "precedes",
  "custom",
];

const SYMMETRIC = new Set<Kind>(["related", "synonym", "antonym"]);

type Props = {
  entityId: string;
  entitySlug: string;
  lang: Locale;
  dict: Dictionary;
  isAuthed: boolean;
  currentUserId: string | null;
};

export function EntityRelations({
  entityId,
  entitySlug,
  lang,
  dict,
  isAuthed,
  currentUserId,
}: Props) {
  const router = useRouter();
  const list = trpc.entityRelation.listForEntity.useQuery({ entityId });
  const [open, setOpen] = useState(false);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          {dict.entityRelations.title}
        </h2>
        {isAuthed && !open && (
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            + {dict.entityRelations.addButton}
          </Button>
        )}
      </div>

      {open && (
        <AddRelationForm
          entityId={entityId}
          lang={lang}
          dict={dict}
          onCancel={() => setOpen(false)}
          onCreated={() => {
            setOpen(false);
            list.refetch();
            router.refresh();
          }}
        />
      )}

      {list.isLoading ? (
        <p className="text-sm text-muted-foreground">…</p>
      ) : (list.data ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {dict.entityRelations.empty}
        </p>
      ) : (
        <ul className="space-y-2">
          {(list.data ?? []).map((r) => {
            const label = describeRelation(r, dict);
            const canDelete =
              currentUserId &&
              r.creator?.id &&
              r.creator.id === currentUserId;
            return (
              <li
                key={r.id}
                className="flex items-center gap-3 rounded-md border border-border px-3 py-2"
              >
                <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider min-w-[110px]">
                  {label}
                </span>
                {r.other && (
                  <Link
                    href={`/${lang}/entities/${r.other.slug}`}
                    className="text-foreground hover:underline underline-offset-2 font-medium"
                  >
                    {r.other.title}
                  </Link>
                )}
                {r.description && (
                  <span className="text-sm text-muted-foreground italic ml-2">
                    — {r.description}
                  </span>
                )}
                {canDelete && (
                  <DeleteButton
                    relationId={r.id}
                    onDone={() => {
                      list.refetch();
                      router.refresh();
                    }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function describeRelation(
  r: {
    kind: Kind;
    customLabel: string | null;
    isOutgoing: boolean;
  },
  dict: Dictionary,
): string {
  if (r.kind === "custom") {
    return r.customLabel ?? dict.entityRelations.kinds.custom;
  }
  const labels = dict.entityRelations.kinds;
  if (SYMMETRIC.has(r.kind)) {
    return labels[r.kind];
  }
  // directional — show different label based on direction
  if (r.kind === "part_of") return r.isOutgoing ? labels.part_of : labels.contains;
  if (r.kind === "contains") return r.isOutgoing ? labels.contains : labels.part_of;
  if (r.kind === "example_of") return r.isOutgoing ? labels.example_of : labels.instance_of;
  if (r.kind === "instance_of") return r.isOutgoing ? labels.instance_of : labels.example_of;
  if (r.kind === "causes") return r.isOutgoing ? labels.causes : labels.caused_by;
  if (r.kind === "precedes") return r.isOutgoing ? labels.precedes : labels.follows;
  return labels[r.kind];
}

function DeleteButton({
  relationId,
  onDone,
}: {
  relationId: string;
  onDone: () => void;
}) {
  const del = trpc.entityRelation.delete.useMutation();
  return (
    <button
      type="button"
      onClick={async () => {
        if (!confirm("Удалить связь?")) return;
        await del.mutateAsync({ id: relationId });
        onDone();
      }}
      disabled={del.isPending}
      className="ml-auto text-xs text-muted-foreground hover:text-rose-600 transition-colors"
    >
      ×
    </button>
  );
}

function AddRelationForm({
  entityId,
  lang,
  dict,
  onCancel,
  onCreated,
}: {
  entityId: string;
  lang: Locale;
  dict: Dictionary;
  onCancel: () => void;
  onCreated: () => void;
}) {
  const candidatesQuery = trpc.entityRelation.searchEntities.useQuery({
    language: lang,
    excludeId: entityId,
  });
  const create = trpc.entityRelation.create.useMutation();

  const [targetId, setTargetId] = useState("");
  const [kind, setKind] = useState<Kind>("related");
  const [customLabel, setCustomLabel] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!targetId) {
      setError(dict.entityRelations.pickTarget);
      return;
    }
    try {
      await create.mutateAsync({
        sourceEntityId: entityId,
        targetEntityId: targetId,
        kind,
        customLabel: kind === "custom" ? customLabel : undefined,
        description: description.trim() ? description.trim() : undefined,
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="target">{dict.entityRelations.target}</Label>
            <select
              id="target"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
              required
            >
              <option value="">— {dict.entityRelations.pickTarget} —</option>
              {(candidatesQuery.data ?? []).map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kind">{dict.entityRelations.kind}</Label>
            <select
              id="kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as Kind)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
            >
              {kinds.map((k) => (
                <option key={k} value={k}>
                  {dict.entityRelations.kinds[k]}
                </option>
              ))}
            </select>
          </div>

          {kind === "custom" && (
            <div className="space-y-1.5">
              <Label htmlFor="customLabel">
                {dict.entityRelations.customLabel}
              </Label>
              <Input
                id="customLabel"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder={dict.entityRelations.customLabelPlaceholder}
                maxLength={100}
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="desc">
              {dict.entityRelations.description}{" "}
              <span className="text-muted-foreground/60">
                ({dict.entityRelations.optional})
              </span>
            </Label>
            <Input
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={dict.entityRelations.descriptionPlaceholder}
              maxLength={500}
            />
          </div>

          {error && (
            <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={create.isPending}
            >
              {dict.addInterpretation.cancel}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={create.isPending || !targetId}
            >
              {create.isPending ? "..." : dict.entityRelations.create}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
