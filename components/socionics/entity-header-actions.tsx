"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc/react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  entity: {
    id: string;
    title: string;
    descriptionWiki: string;
    slug: string;
  };
  lang: Locale;
  dict: Dictionary;
};

export function EntityHeaderActions({ entity, lang, dict }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <EditEntityForm
        entity={entity}
        dict={dict}
        onCancel={() => setEditing(false)}
        onSaved={() => {
          setEditing(false);
          router.refresh();
        }}
      />
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        {dict.actions.edit}
      </button>
      <DeleteEntityButton
        entity={entity}
        dict={dict}
        onDeleted={() => {
          router.push(`/${lang}/entities`);
          router.refresh();
        }}
      />
    </div>
  );
}

function EditEntityForm({
  entity,
  dict,
  onCancel,
  onSaved,
}: {
  entity: Props["entity"];
  dict: Dictionary;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const update = trpc.entity.update.useMutation();
  const [title, setTitle] = useState(entity.title);
  const [description, setDescription] = useState(entity.descriptionWiki);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      await update.mutateAsync({
        id: entity.id,
        title,
        descriptionWiki: description,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 w-full max-w-2xl">
      <div className="space-y-1.5">
        <Label htmlFor="entity-title">{dict.addEntity.title}</Label>
        <Input
          id="entity-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={300}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="entity-desc">{dict.addEntity.description}</Label>
        <Textarea
          id="entity-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          minLength={20}
          maxLength={3000}
          required
        />
      </div>
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

function DeleteEntityButton({
  entity,
  dict,
  onDeleted,
}: {
  entity: Props["entity"];
  dict: Dictionary;
  onDeleted: () => void;
}) {
  const del = trpc.entity.delete.useMutation();
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <button
        type="button"
        onClick={async () => {
          if (!confirm(dict.actions.confirmDeleteEntity)) return;
          setError(null);
          try {
            await del.mutateAsync({ id: entity.id });
            onDeleted();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка");
          }
        }}
        disabled={del.isPending}
        className="text-muted-foreground hover:text-rose-600 transition-colors"
      >
        {dict.actions.delete}
      </button>
      {error && (
        <span className="text-rose-600 dark:text-rose-400 text-[11px]">
          {error}
        </span>
      )}
    </>
  );
}
