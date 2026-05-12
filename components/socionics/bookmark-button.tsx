"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/react";

type Target = "entity" | "interpretation" | "theory" | "theory_object" | "publication" | "product";

type Props = {
  targetType: Target;
  targetId: string;
  isAuthed: boolean;
  loginHref: string;
  initialBookmarked?: boolean;
  size?: "default" | "sm";
};

export function BookmarkButton({
  targetType,
  targetId,
  isAuthed,
  loginHref,
  initialBookmarked,
  size = "default",
}: Props) {
  const router = useRouter();
  const toggle = trpc.bookmark.toggle.useMutation();
  const check = trpc.bookmark.check.useQuery(
    { targetType, targetId },
    {
      enabled: isAuthed && initialBookmarked === undefined,
      staleTime: 30_000,
    },
  );
  const [bookmarked, setBookmarked] = useState<boolean>(
    initialBookmarked ?? false,
  );

  useEffect(() => {
    if (check.data) setBookmarked(check.data.bookmarked);
  }, [check.data]);

  async function onClick() {
    if (!isAuthed) {
      router.push(loginHref);
      return;
    }
    const prev = bookmarked;
    setBookmarked(!prev);
    try {
      const r = await toggle.mutateAsync({ targetType, targetId });
      setBookmarked(r.bookmarked);
    } catch {
      setBookmarked(prev);
    }
  }

  const sz = size === "sm" ? "size-3.5" : "size-4";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={toggle.isPending}
      title={bookmarked ? "В закладках" : "В закладки"}
      className={cn(
        "rounded p-1 transition-colors disabled:opacity-50",
        bookmarked
          ? "text-amber-500 hover:bg-muted"
          : "text-muted-foreground hover:text-amber-500 hover:bg-muted",
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={bookmarked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={sz}
      >
        <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
