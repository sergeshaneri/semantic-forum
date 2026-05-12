"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc/react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Props = {
  user: {
    username: string;
    name: string;
    bio: string;
    image: string | null;
  };
  dict: Dictionary;
};

export function ProfileEditActions({ user, dict }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <EditProfile
        user={user}
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
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="text-xs rounded-md border border-border px-2.5 py-1 hover:bg-muted transition-colors"
    >
      {dict.profile.editButton}
    </button>
  );
}

function EditProfile({
  user,
  dict,
  onCancel,
  onSaved,
}: {
  user: Props["user"];
  dict: Dictionary;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const update = trpc.user.updateProfile.useMutation();
  const [name, setName] = useState(user.name || user.username);
  const [bio, setBio] = useState(user.bio);
  const [image, setImage] = useState(user.image ?? "");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      await update.mutateAsync({
        name,
        bio: bio.trim() ? bio.trim() : undefined,
        image: image.trim() ? image.trim() : undefined,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-xl w-full">
      <div className="space-y-1.5">
        <Label htmlFor="prof-name">{dict.profile.displayName}</Label>
        <Input
          id="prof-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={128}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="prof-bio">{dict.profile.bio}</Label>
        <Textarea
          id="prof-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder={dict.profile.bioPlaceholder}
        />
        <p className="text-xs text-muted-foreground">{bio.length}/1000</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="prof-image">{dict.profile.imageUrl}</Label>
        <Input
          id="prof-image"
          type="url"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://..."
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground">
          {dict.profile.imageHint}
        </p>
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
