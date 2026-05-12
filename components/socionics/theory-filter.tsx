"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Props = {
  dict: Dictionary;
  choices: { slug: string; name: string }[];
  current: string | null;
};

export function TheoryFilter({ dict, choices, current }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  function onChange(slug: string) {
    const next = new URLSearchParams(params?.toString() ?? "");
    if (slug) next.set("theory", slug);
    else next.delete("theory");
    const qs = next.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : (pathname ?? "/"));
      router.refresh();
    });
  }

  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>{dict.interpretation.filterByTheory}:</span>
      <select
        value={current ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-input bg-transparent px-2 py-1 text-sm"
      >
        <option value="">{dict.interpretation.allTheories}</option>
        {choices.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}
