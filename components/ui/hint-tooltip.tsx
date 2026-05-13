"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  text: string;
  className?: string;
};

/**
 * Inline `?` icon with a hover/click tooltip.
 * Click toggle for touch devices; hover for desktop.
 */
export function HintTooltip({ text, className }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <span
      ref={ref}
      className={`relative inline-flex items-center ${className ?? ""}`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-label="Hint"
        className="inline-flex size-4 items-center justify-center rounded-full border border-border text-[10px] font-semibold leading-none text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        tabIndex={0}
      >
        ?
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute z-30 bottom-full left-1/2 mb-2 -translate-x-1/2 w-64 rounded-md border border-border bg-popover text-popover-foreground shadow-md px-3 py-2 text-xs leading-relaxed font-normal normal-case tracking-normal"
          style={{ maxWidth: "min(16rem, calc(100vw - 2rem))" }}
        >
          {text}
        </span>
      )}
    </span>
  );
}
