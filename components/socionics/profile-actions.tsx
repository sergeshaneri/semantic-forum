"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc/react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type LinkKind =
  | "website"
  | "telegram"
  | "youtube"
  | "instagram"
  | "twitter"
  | "vk"
  | "linkedin"
  | "github"
  | "other";

type Link = {
  id: string;
  kind: LinkKind;
  label: string;
  url: string;
};

type Props = {
  user: {
    username: string;
    name: string;
    bio: string;
    image: string | null;
    roles: string[];
  };
  links: Link[];
  dict: Dictionary;
};

const PRESET_ROLES: { value: string; ruLabel: string; enLabel: string }[] = [
  { value: "Соционик-теоретик", ruLabel: "Соционик-теоретик", enLabel: "Theorist" },
  { value: "Соционик-практик", ruLabel: "Соционик-практик", enLabel: "Practitioner" },
  { value: "Любитель", ruLabel: "Любитель", enLabel: "Enthusiast" },
  { value: "Пользователь", ruLabel: "Пользователь", enLabel: "User" },
  { value: "Начинающий", ruLabel: "Начинающий", enLabel: "Beginner" },
  { value: "Эксперт-смежник", ruLabel: "Эксперт в смежной области", enLabel: "Adjacent expert" },
  { value: "Психолог", ruLabel: "Психолог", enLabel: "Psychologist" },
  { value: "Лингвист", ruLabel: "Лингвист", enLabel: "Linguist" },
  { value: "Философ", ruLabel: "Философ", enLabel: "Philosopher" },
];

export function ProfileEditActions({ user, links, dict }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [managingLinks, setManagingLinks] = useState(false);

  return (
    <div className="flex flex-col items-end gap-2 w-full max-w-md">
      {editing && (
        <EditProfile
          user={user}
          dict={dict}
          onCancel={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            router.refresh();
          }}
        />
      )}
      {managingLinks && (
        <ManageLinks
          links={links}
          dict={dict}
          onClose={() => {
            setManagingLinks(false);
            router.refresh();
          }}
        />
      )}
      {!editing && !managingLinks && (
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs rounded-md border border-border px-2.5 py-1 hover:bg-muted transition-colors"
          >
            {dict.profile.editButton}
          </button>
          <button
            type="button"
            onClick={() => setManagingLinks(true)}
            className="text-xs rounded-md border border-border px-2.5 py-1 hover:bg-muted transition-colors"
          >
            {dict.profile.manageLinks}
          </button>
        </div>
      )}
    </div>
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
  const [roles, setRoles] = useState<string[]>(user.roles);
  const [customRole, setCustomRole] = useState("");
  const [error, setError] = useState<string | null>(null);

  function togglePreset(value: string) {
    setRoles((prev) =>
      prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value],
    );
  }

  function addCustom() {
    const v = customRole.trim();
    if (!v || roles.includes(v) || roles.length >= 8) return;
    setRoles((prev) => [...prev, v]);
    setCustomRole("");
  }

  function removeRole(value: string) {
    setRoles((prev) => prev.filter((r) => r !== value));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      await update.mutateAsync({
        name,
        bio: bio.trim() ? bio.trim() : undefined,
        image: image.trim() ? image.trim() : undefined,
        roles,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-5">
        <form onSubmit={onSubmit} className="space-y-4">
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
            <Label>{dict.profile.rolesTitle}</Label>
            <p className="text-xs text-muted-foreground">
              {dict.profile.rolesHint}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_ROLES.map((r) => {
                const selected = roles.includes(r.value);
                return (
                  <button
                    type="button"
                    key={r.value}
                    onClick={() => togglePreset(r.value)}
                    className={`text-xs rounded-full border px-2.5 py-1 transition-colors ${
                      selected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {r.ruLabel}
                  </button>
                );
              })}
            </div>
            {roles.some((r) => !PRESET_ROLES.find((p) => p.value === r)) && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {roles
                  .filter((r) => !PRESET_ROLES.find((p) => p.value === r))
                  .map((r) => (
                    <span
                      key={r}
                      className="text-xs rounded-full border border-foreground bg-foreground text-background px-2.5 py-1 inline-flex items-center gap-1"
                    >
                      {r}
                      <button
                        type="button"
                        onClick={() => removeRole(r)}
                        className="hover:opacity-70"
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <Input
                placeholder={dict.profile.rolesCustomPlaceholder}
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustom();
                  }
                }}
                maxLength={80}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addCustom}
                disabled={!customRole.trim() || roles.length >= 8}
              >
                +
              </Button>
            </div>
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
      </CardContent>
    </Card>
  );
}

const LINK_KINDS: { value: LinkKind; ruLabel: string }[] = [
  { value: "website", ruLabel: "Сайт" },
  { value: "telegram", ruLabel: "Telegram" },
  { value: "youtube", ruLabel: "YouTube" },
  { value: "instagram", ruLabel: "Instagram" },
  { value: "twitter", ruLabel: "X / Twitter" },
  { value: "vk", ruLabel: "ВКонтакте" },
  { value: "linkedin", ruLabel: "LinkedIn" },
  { value: "github", ruLabel: "GitHub" },
  { value: "other", ruLabel: "Другое" },
];

function ManageLinks({
  links,
  dict,
  onClose,
}: {
  links: Link[];
  dict: Dictionary;
  onClose: () => void;
}) {
  const router = useRouter();
  const create = trpc.userLink.create.useMutation();
  const del = trpc.userLink.delete.useMutation();
  const [kind, setKind] = useState<LinkKind>("website");
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({ kind, label, url });
      setLabel("");
      setUrl("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  async function onDelete(id: string) {
    if (!confirm(dict.actions.confirmDelete)) return;
    await del.mutateAsync({ id });
    router.refresh();
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-5 space-y-4">
        <h3 className="font-heading text-base font-medium">
          {dict.profile.manageLinks}
        </h3>
        {links.length > 0 && (
          <ul className="space-y-1.5">
            {links.map((l) => (
              <li
                key={l.id}
                className="flex items-center gap-2 text-sm rounded-md border border-border px-2.5 py-1.5"
              >
                <span className="text-xs text-muted-foreground font-mono min-w-[70px]">
                  {LINK_KINDS.find((k) => k.value === l.kind)?.ruLabel ?? l.kind}
                </span>
                <span className="font-medium">{l.label}</span>
                <span className="text-xs text-muted-foreground truncate flex-1">
                  {l.url}
                </span>
                <button
                  type="button"
                  onClick={() => onDelete(l.id)}
                  className="text-xs text-muted-foreground hover:text-rose-600 transition-colors"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={onAdd} className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as LinkKind)}
              className="rounded-md border border-input bg-transparent px-2 py-1.5 text-sm"
            >
              {LINK_KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.ruLabel}
                </option>
              ))}
            </select>
            <Input
              placeholder={dict.profile.linkLabelPlaceholder}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={100}
              required
            />
            <Input
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              maxLength={500}
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
              onClick={onClose}
              disabled={create.isPending}
            >
              {dict.profile.linksClose}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={create.isPending || !label || !url}
            >
              {create.isPending ? "..." : dict.profile.addLink}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
