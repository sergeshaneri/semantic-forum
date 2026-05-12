"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  lang: Locale;
  dict: Dictionary;
};

export function SearchBar({ lang, dict }: Props) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    router.push(`/${lang}/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={onSubmit} className="relative w-full max-w-xs">
      <Input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={dict.search.placeholder}
        className="h-8 pl-7 text-sm"
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    </form>
  );
}
