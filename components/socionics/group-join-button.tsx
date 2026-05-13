"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/lib/trpc/react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Props = {
  groupId: string;
  isMember: boolean;
  isOwner: boolean;
  isAuthed: boolean;
  loginHref: string;
  dict: Dictionary;
};

export function GroupJoinButton({
  groupId,
  isMember: initialMember,
  isOwner,
  isAuthed,
  loginHref,
  dict,
}: Props) {
  const router = useRouter();
  const join = trpc.group.join.useMutation();
  const leave = trpc.group.leave.useMutation();
  const [isMember, setIsMember] = useState(initialMember);

  if (isOwner) return null;

  async function onClick() {
    if (!isAuthed) {
      router.push(loginHref);
      return;
    }
    const prev = isMember;
    setIsMember(!prev);
    try {
      if (prev) {
        await leave.mutateAsync({ groupId });
      } else {
        await join.mutateAsync({ groupId });
      }
      router.refresh();
    } catch {
      setIsMember(prev);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={join.isPending || leave.isPending}
      className={`text-sm rounded-md px-3 py-1.5 transition-colors disabled:opacity-50 ${
        isMember
          ? "border border-border hover:bg-muted"
          : "bg-foreground text-background hover:opacity-90"
      }`}
    >
      {isMember ? dict.groups.leave : dict.groups.join}
    </button>
  );
}
