"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  trigger: (open: () => void) => React.ReactNode;
};

/**
 * Lightweight accessible confirmation dialog without external deps.
 * Use instead of window.confirm() for destructive actions.
 */
export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = true,
  onConfirm,
  trigger,
}: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    // focus first button
    dialogRef.current?.querySelector("button")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function confirm() {
    setBusy(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {trigger(() => setOpen(true))}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            ref={dialogRef}
            className="w-full max-w-md rounded-lg border border-border bg-background shadow-lg p-5 space-y-4"
          >
            <h2
              id="confirm-dialog-title"
              className="font-heading text-lg font-semibold"
            >
              {title}
            </h2>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={busy}
                className="text-sm rounded-md border border-border px-3 py-1.5 hover:bg-muted transition-colors disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={busy}
                className={`text-sm rounded-md px-3 py-1.5 transition-colors disabled:opacity-50 text-background ${
                  destructive
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-foreground hover:opacity-90"
                }`}
              >
                {busy ? "…" : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
