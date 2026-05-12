"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc/react";
import { formatPrice } from "@/lib/format";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type ProductKind = "course" | "consultation" | "book" | "typing" | "workshop" | "other";

type Product = {
  id: string;
  kind: ProductKind;
  title: string;
  description: string;
  priceCents: number | null;
  currency: string | null;
  url: string | null;
  reviewCount: number;
  ratingAvg: number | null;
};

type Props = {
  username: string;
  isSelf: boolean;
  products: Product[];
  lang: Locale;
  dict: Dictionary;
};

export function ProfileProducts({
  username,
  isSelf,
  products,
  lang,
  dict,
}: Props) {
  const [adding, setAdding] = useState(false);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          {dict.products.title}
        </h2>
        {isSelf && !adding && (
          <Button size="sm" onClick={() => setAdding(true)}>
            + {dict.products.addButton}
          </Button>
        )}
      </div>

      {adding && (
        <AddProductForm
          lang={lang}
          dict={dict}
          username={username}
          onCancel={() => setAdding(false)}
          onCreated={() => setAdding(false)}
        />
      )}

      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">{dict.products.empty}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/${lang}/u/${username}/products/${p.id}`}
              className="block"
            >
              <Card className="hover:border-foreground/40 transition-colors">
                <CardContent className="py-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                    <span className="font-mono uppercase tracking-wider">
                      {dict.products.kinds[p.kind]}
                    </span>
                    {p.ratingAvg !== null && (
                      <span className="font-mono">
                        ★ {p.ratingAvg.toFixed(1)} · {p.reviewCount}{" "}
                        {dict.products.reviewsCount}
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading text-lg">{p.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {p.description}
                  </p>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="font-semibold text-foreground">
                      {p.priceCents !== null && p.currency
                        ? formatPrice(p.priceCents, p.currency)
                        : dict.products.priceOnRequest}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function AddProductForm({
  lang,
  dict,
  username,
  onCancel,
  onCreated,
}: {
  lang: Locale;
  dict: Dictionary;
  username: string;
  onCancel: () => void;
  onCreated: () => void;
}) {
  const router = useRouter();
  const create = trpc.product.create.useMutation();
  const [kind, setKind] = useState<ProductKind>("consultation");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceText, setPriceText] = useState("");
  const [currency, setCurrency] = useState("RUB");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const parsed = priceText.trim()
      ? Math.round(Number.parseFloat(priceText.replace(",", ".")) * 100)
      : undefined;
    if (priceText.trim() && (parsed === undefined || Number.isNaN(parsed))) {
      setError("Неверный формат цены");
      return;
    }
    try {
      const r = await create.mutateAsync({
        kind,
        title,
        description,
        priceCents: parsed,
        currency: parsed !== undefined ? currency : undefined,
        url: url || undefined,
        language: lang,
      });
      onCreated();
      router.push(`/${lang}/u/${username}/products/${r.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  const kinds: ProductKind[] = [
    "consultation",
    "course",
    "book",
    "typing",
    "workshop",
    "other",
  ];

  return (
    <Card>
      <CardContent className="pt-5">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>{dict.products.kindLabel}</Label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as ProductKind)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            >
              {kinds.map((k) => (
                <option key={k} value={k}>
                  {dict.products.kinds[k]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>{dict.products.formTitle}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={300}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>{dict.products.description}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              minLength={20}
              maxLength={5000}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-1.5">
              <Label>{dict.products.price}</Label>
              <Input
                value={priceText}
                onChange={(e) => setPriceText(e.target.value)}
                placeholder="5000"
                inputMode="decimal"
              />
              <p className="text-xs text-muted-foreground">
                {dict.products.priceHint}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>{dict.products.currency}</Label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              >
                <option value="RUB">RUB</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="UAH">UAH</option>
                <option value="KZT">KZT</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{dict.products.url}</Label>
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {dict.products.urlHint}
            </p>
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
              disabled={create.isPending}
            >
              {dict.addInterpretation.cancel}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={create.isPending || !title || !description}
            >
              {create.isPending ? "..." : dict.products.publish}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
