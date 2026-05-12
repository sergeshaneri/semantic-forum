"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Props = {
  username: string;
  initialFollowing: boolean;
  dict: Dictionary;
  loginHref: string;
  isAuthed: boolean;
};

export function FollowButton({
  username,
  initialFollowing,
  dict,
  loginHref,
  isAuthed,
}: Props) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const follow = trpc.user.follow.useMutation();
  const unfollow = trpc.user.unfollow.useMutation();
  const pending = follow.isPending || unfollow.isPending;

  if (!isAuthed) {
    return (
      <Button size="sm" onClick={() => router.push(loginHref)}>
        {dict.profile.follow}
      </Button>
    );
  }

  async function onClick() {
    const prev = following;
    setFollowing(!prev);
    try {
      if (prev) {
        await unfollow.mutateAsync({ username });
      } else {
        await follow.mutateAsync({ username });
      }
      router.refresh();
    } catch {
      setFollowing(prev);
    }
  }

  return (
    <Button
      size="sm"
      variant={following ? "outline" : "default"}
      onClick={onClick}
      disabled={pending}
    >
      {following ? dict.profile.unfollow : dict.profile.follow}
    </Button>
  );
}
