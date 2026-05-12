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
  object: {
    id: string;
    name: string;
    description: string;
  };
  theorySlug: string;
  lang: Locale;
  dict: Dictionary;
};

export function TheoryObjectActions({ object, theorySlug, lang, dict }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <EditForm
        object={object}
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
      <DeleteButton
        object={object}
        theorySlug={theorySlug}
        lang={lang}
        dict={dict}
      />
    </div>
  );
}

function EditForm({
  object,
  dict,
  onCancel,
  onSaved,
}: {
  object: Props["object"];
  dict: Dictionary;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const update = trpc.theoryObject.update.useMutation();
  const [name, setName] = useState(object.name);
  const [description, setDescription] = useState(object.description);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      await update.mutateAsync({ id: object.id, name, description });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 w-full max-w-2xl">
      <div className="space-y-1.5">
        <Label>{dict.addTheoryObject.name}</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={200}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label>{dict.addTheoryObject.description}</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          minLength={10}
          maxLength={5000}
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

function DeleteButton({
  object,
  theorySlug,
  lang,
  dict,
}: {
  object: Props["object"];
  theorySlug: string;
  lang: Locale;
  dict: Dictionary;
}) {
  const router = useRouter();
  const del = trpc.theoryObject.delete.useMutation();
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <button
        type="button"
        onClick={async () => {
          if (!confirm(dict.actions.confirmDelete)) return;
          setError(null);
          try {
            await del.mutateAsync({ id: object.id });
            router.push(`/${lang}/theories/${theorySlug}`);
            router.refresh();
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
