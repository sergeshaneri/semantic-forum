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
import { slugify } from "@/lib/slug";

type Props = {
  theory: {
    id: string;
    slug: string;
    name: string;
    description: string;
    isSeed: boolean;
    authorId: string | null;
  };
  lang: Locale;
  dict: Dictionary;
  isAuthed: boolean;
  isOwner: boolean;
};

export function TheoryHeaderActions({
  theory,
  lang,
  dict,
  isAuthed,
  isOwner,
}: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"none" | "edit" | "fork">("none");

  if (mode === "edit") {
    return (
      <EditTheory
        theory={theory}
        dict={dict}
        onCancel={() => setMode("none")}
        onSaved={() => {
          setMode("none");
          router.refresh();
        }}
      />
    );
  }

  if (mode === "fork") {
    return (
      <ForkTheory
        theory={theory}
        lang={lang}
        dict={dict}
        onCancel={() => setMode("none")}
        onForked={(slug) => {
          router.push(`/${lang}/theories/${slug}`);
          router.refresh();
        }}
      />
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {isAuthed && (
        <Button size="sm" onClick={() => setMode("fork")}>
          ⑂ {dict.theories.fork}
        </Button>
      )}
      {isOwner && (
        <>
          <button
            type="button"
            onClick={() => setMode("edit")}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {dict.actions.edit}
          </button>
          <DeleteTheory theory={theory} dict={dict} lang={lang} />
        </>
      )}
    </div>
  );
}

function EditTheory({
  theory,
  dict,
  onCancel,
  onSaved,
}: {
  theory: Props["theory"];
  dict: Dictionary;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const update = trpc.theory.update.useMutation();
  const [name, setName] = useState(theory.name);
  const [description, setDescription] = useState(theory.description);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      await update.mutateAsync({ id: theory.id, name, description });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-2xl w-full">
      <div className="space-y-1.5">
        <Label>{dict.addTheory.name}</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={200}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label>{dict.addTheory.description}</Label>
        <Textarea
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

function ForkTheory({
  theory,
  lang,
  dict,
  onCancel,
  onForked,
}: {
  theory: Props["theory"];
  lang: Locale;
  dict: Dictionary;
  onCancel: () => void;
  onForked: (slug: string) => void;
}) {
  void lang;
  const fork = trpc.theory.fork.useMutation();
  const [name, setName] = useState(`${theory.name} (мой форк)`);
  const [slug, setSlug] = useState(`${theory.slug}-fork`);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      const r = await fork.mutateAsync({
        sourceSlug: theory.slug,
        language: "ru",
        newName: name,
        newSlug: slug,
      });
      onForked(r.slug);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-xl w-full">
      <h3 className="text-sm uppercase tracking-wider text-muted-foreground">
        {dict.theories.forkTitle}
      </h3>
      <div className="space-y-1.5">
        <Label>{dict.addTheory.name}</Label>
        <Input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSlug(slugify(e.target.value));
          }}
          maxLength={200}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label>{dict.addTheory.slug}</Label>
        <Input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          maxLength={200}
          required
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {dict.theories.forkHint}
      </p>
      {error && (
        <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
      )}
      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={fork.isPending}
        >
          {dict.addInterpretation.cancel}
        </Button>
        <Button type="submit" size="sm" disabled={fork.isPending}>
          {fork.isPending ? "..." : dict.theories.fork}
        </Button>
      </div>
    </form>
  );
}

function DeleteTheory({
  theory,
  dict,
  lang,
}: {
  theory: Props["theory"];
  dict: Dictionary;
  lang: Locale;
}) {
  const router = useRouter();
  const del = trpc.theory.delete.useMutation();
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <button
        type="button"
        onClick={async () => {
          if (!confirm(dict.actions.confirmDeleteTheory)) return;
          setError(null);
          try {
            await del.mutateAsync({ id: theory.id });
            router.push(`/${lang}/theories`);
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка");
          }
        }}
        disabled={del.isPending}
        className="text-xs text-muted-foreground hover:text-rose-600 transition-colors"
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
