"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Scope = "read" | "write:content" | "write:social" | "admin";

type Props = {
  dict: Dictionary;
};

export function ApiKeysManager({ dict }: Props) {
  const list = trpc.apiKey.mine.useQuery();
  const create = trpc.apiKey.create.useMutation();
  const revoke = trpc.apiKey.revoke.useMutation();

  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState("");
  const [scopes, setScopes] = useState<Scope[]>(["write:content"]);
  const [expiresInDays, setExpiresInDays] = useState<string>("");
  const [revealed, setRevealed] = useState<{
    raw: string;
    prefix: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleScope(s: Scope) {
    setScopes((prev) =>
      prev.includes(s) ? prev.filter((p) => p !== s) : [...prev, s],
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (scopes.length === 0) return;
    try {
      const r = await create.mutateAsync({
        label: label.trim() || undefined,
        scopes,
        expiresInDays: expiresInDays
          ? Math.max(1, Math.min(3650, parseInt(expiresInDays, 10) || 0))
          : undefined,
      });
      setRevealed({ raw: r.raw, prefix: r.prefix });
      setShowForm(false);
      setLabel("");
      setScopes(["write:content"]);
      setExpiresInDays("");
      await list.refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  async function onRevoke(id: string) {
    await revoke.mutateAsync({ id });
    await list.refetch();
  }

  async function copyRaw() {
    if (!revealed) return;
    try {
      await navigator.clipboard.writeText(revealed.raw);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  const rows = list.data ?? [];

  return (
    <div className="space-y-5">
      {!showForm && (
        <Button size="sm" onClick={() => setShowForm(true)}>
          + {dict.apiKeys.create}
        </Button>
      )}

      {showForm && (
        <Card>
          <CardContent className="pt-5">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>{dict.apiKeys.labelLabel}</Label>
                <Input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder={dict.apiKeys.labelPlaceholder}
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label>{dict.apiKeys.scopesLabel}</Label>
                <ScopeRow
                  scope="read"
                  label={dict.apiKeys.scopeRead}
                  hint={dict.apiKeys.scopeReadHint}
                  checked={scopes.includes("read")}
                  onToggle={() => toggleScope("read")}
                />
                <ScopeRow
                  scope="write:content"
                  label={dict.apiKeys.scopeWriteContent}
                  hint={dict.apiKeys.scopeWriteContentHint}
                  checked={scopes.includes("write:content")}
                  onToggle={() => toggleScope("write:content")}
                />
                <ScopeRow
                  scope="write:social"
                  label={dict.apiKeys.scopeWriteSocial}
                  hint={dict.apiKeys.scopeWriteSocialHint}
                  checked={scopes.includes("write:social")}
                  onToggle={() => toggleScope("write:social")}
                />
                <ScopeRow
                  scope="admin"
                  label={dict.apiKeys.scopeAdmin}
                  hint={dict.apiKeys.scopeAdminHint}
                  checked={scopes.includes("admin")}
                  onToggle={() => toggleScope("admin")}
                  disabledNote
                />
              </div>

              <div className="space-y-1.5">
                <Label>
                  {dict.apiKeys.expiresLabel}{" "}
                  <span className="text-xs text-muted-foreground">
                    ({dict.apiKeys.expiresNever} = ∅)
                  </span>
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={3650}
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                  placeholder="30"
                />
                <p className="text-xs text-muted-foreground">
                  {dict.apiKeys.expiresDays}
                </p>
              </div>

              {error && (
                <p className="text-sm text-rose-600 dark:text-rose-400">
                  {error}
                </p>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowForm(false)}
                  disabled={create.isPending}
                >
                  {dict.actions.cancel}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={create.isPending || scopes.length === 0}
                >
                  {create.isPending ? "…" : dict.apiKeys.createButton}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {revealed && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg rounded-lg border border-border bg-background shadow-lg p-5 space-y-4">
            <div className="space-y-1">
              <h2 className="font-heading text-lg font-semibold">
                {dict.apiKeys.saveCopyTitle}
              </h2>
              <p className="text-sm text-muted-foreground">
                {dict.apiKeys.saveCopyHint}
              </p>
            </div>
            <div className="rounded-md border border-border bg-muted/50 p-3">
              <code className="text-xs break-all font-mono select-all">
                {revealed.raw}
              </code>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={copyRaw}
                className="text-sm rounded-md border border-border px-3 py-1.5 hover:bg-muted transition-colors"
              >
                {copied ? dict.apiKeys.copied : dict.apiKeys.copy}
              </button>
              <button
                type="button"
                onClick={() => setRevealed(null)}
                className="text-sm rounded-md bg-foreground text-background px-3 py-1.5 hover:opacity-90"
              >
                {dict.apiKeys.closeNotice}
              </button>
            </div>
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{dict.apiKeys.empty}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((k) => {
            const isRevoked = Boolean(k.revokedAt);
            const isExpired =
              k.expiresAt && new Date(k.expiresAt).getTime() < Date.now();
            const inactive = isRevoked || isExpired;
            return (
              <li
                key={k.id}
                className={`rounded-md border px-3 py-2.5 space-y-1.5 ${
                  inactive
                    ? "border-border bg-muted/30 opacity-70"
                    : "border-border"
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="font-mono text-sm text-foreground">
                    {k.prefix}…
                  </code>
                  {k.label && (
                    <span className="text-sm text-muted-foreground">
                      {k.label}
                    </span>
                  )}
                  {isRevoked && (
                    <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-700 dark:text-rose-300">
                      {dict.apiKeys.revoked}
                    </span>
                  )}
                  {!isRevoked && isExpired && (
                    <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                      {dict.apiKeys.expired}
                    </span>
                  )}
                  {!inactive && (
                    <ConfirmDialog
                      title={dict.apiKeys.confirmRevokeTitle}
                      description={dict.apiKeys.confirmRevokeBody}
                      confirmLabel={dict.apiKeys.revoke}
                      cancelLabel={dict.actions.cancel}
                      onConfirm={() => onRevoke(k.id)}
                      trigger={(open) => (
                        <button
                          type="button"
                          onClick={open}
                          className="ml-auto text-xs text-muted-foreground hover:text-rose-600 transition-colors"
                        >
                          {dict.apiKeys.revoke}
                        </button>
                      )}
                    />
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {k.scopes.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-foreground/5 font-mono"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {dict.apiKeys.createdAt}:{" "}
                  {new Date(k.createdAt).toLocaleDateString()}
                  {" · "}
                  {k.lastUsedAt
                    ? `${dict.apiKeys.lastUsed}: ${new Date(k.lastUsedAt).toLocaleDateString()}`
                    : dict.apiKeys.neverUsed}
                  {k.expiresAt &&
                    ` · ${dict.apiKeys.expiresOn}: ${new Date(k.expiresAt).toLocaleDateString()}`}
                  {k.revokedAt &&
                    ` · ${dict.apiKeys.revokedAt}: ${new Date(k.revokedAt).toLocaleDateString()}`}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ScopeRow({
  scope,
  label,
  hint,
  checked,
  onToggle,
  disabledNote,
}: {
  scope: string;
  label: string;
  hint: string;
  checked: boolean;
  onToggle: () => void;
  disabledNote?: boolean;
}) {
  return (
    <label className="flex items-start gap-2 cursor-pointer rounded-md hover:bg-muted/40 p-1.5 -mx-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{label}</span>
          <code className="text-[10px] text-muted-foreground font-mono">
            {scope}
          </code>
        </div>
        <p className="text-xs text-muted-foreground">{hint}</p>
        {disabledNote && checked && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
            ⚠ только из браузера
          </p>
        )}
      </div>
    </label>
  );
}
