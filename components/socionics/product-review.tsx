"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc/react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Props = {
  productId: string;
  isAuthed: boolean;
  isOwner: boolean;
  loginHref: string;
  existing: { id: string; rating: number; body: string } | null;
  dict: Dictionary;
};

export function ProductReviewForm({
  productId,
  isAuthed,
  isOwner,
  loginHref,
  existing,
  dict,
}: Props) {
  const router = useRouter();
  const upsert = trpc.product.reviewUpsert.useMutation();
  const del = trpc.product.reviewDelete.useMutation();
  const [rating, setRating] = useState<number>(existing?.rating ?? 5);
  const [body, setBody] = useState(existing?.body ?? "");
  const [error, setError] = useState<string | null>(null);

  if (isOwner) {
    return (
      <p className="text-sm text-muted-foreground italic">
        {dict.products.ownerNoReview}
      </p>
    );
  }

  if (!isAuthed) {
    return (
      <p className="text-sm text-muted-foreground">
        <a
          href={loginHref}
          className="text-foreground underline underline-offset-2"
        >
          {dict.products.loginToReview}
        </a>
      </p>
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      await upsert.mutateAsync({ productId, rating, body });
      setBody("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  async function onDelete() {
    if (!existing || !confirm(dict.actions.confirmDelete)) return;
    await del.mutateAsync({ id: existing.id });
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="pt-5 space-y-3">
        <h3 className="font-heading text-base font-medium">
          {existing ? dict.products.yourReview : dict.products.leaveReview}
        </h3>
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`text-2xl transition-colors ${
                  n <= rating
                    ? "text-amber-500"
                    : "text-muted-foreground/40 hover:text-amber-500/50"
                }`}
              >
                ★
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              {rating}/5
            </span>
          </div>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            minLength={10}
            maxLength={3000}
            placeholder={dict.products.reviewPlaceholder}
            required
          />
          {error && (
            <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          )}
          <div className="flex gap-2 justify-end">
            {existing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onDelete}
                disabled={del.isPending}
              >
                {dict.actions.delete}
              </Button>
            )}
            <Button type="submit" size="sm" disabled={upsert.isPending}>
              {upsert.isPending
                ? "..."
                : existing
                  ? dict.actions.save
                  : dict.products.publishReview}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
