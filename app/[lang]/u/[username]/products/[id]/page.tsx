import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProductReviewForm } from "@/components/socionics/product-review";
import { auth } from "@/lib/auth/auth";
import { formatPrice } from "@/lib/format";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ lang: string; username: string; id: string }>;
}) {
  const { lang, username, id } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  let data;
  try {
    data = await api.product.getById({ id });
  } catch {
    notFound();
  }

  const { product, owner, reviews, ratingAvg, reviewCount, viewerReview } = data;
  if (!owner || owner.username !== username) notFound();

  const session = await auth();
  const isAuthed = Boolean(session?.user);
  const currentUserId =
    (session?.user as { id?: string } | undefined)?.id ?? null;
  const isOwner = currentUserId !== null && currentUserId === product.ownerId;

  return (
    <article className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <Link
        href={`/${lang}/u/${username}`}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
      >
        {dict.products.backToProfile} @{username}
      </Link>

      <header className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs font-normal">
            {dict.products.kinds[product.kind]}
          </Badge>
          {ratingAvg !== null && (
            <span className="text-xs text-amber-600 font-mono">
              ★ {ratingAvg.toFixed(1)} · {reviewCount}{" "}
              {dict.products.reviewsCount}
            </span>
          )}
        </div>
        <h1 className="font-heading text-4xl font-semibold tracking-tight leading-tight">
          {product.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          <Link
            href={`/${lang}/u/${owner.username}`}
            className="text-foreground font-medium hover:underline underline-offset-2"
          >
            @{owner.username}
          </Link>
        </p>
        <p className="text-[15px] leading-relaxed text-foreground whitespace-pre-line">
          {product.description}
        </p>
        <div className="flex items-center gap-3 flex-wrap pt-2">
          <span className="font-heading text-2xl font-semibold">
            {product.priceCents !== null && product.currency
              ? formatPrice(product.priceCents, product.currency)
              : dict.products.priceOnRequest}
          </span>
          {product.url && (
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm rounded-md bg-foreground text-background px-3 py-1.5 hover:opacity-90 transition-opacity"
            >
              {product.url}
            </a>
          )}
        </div>
      </header>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            {dict.products.reviewsTitle}
          </h2>
          {ratingAvg !== null && (
            <span className="text-sm text-muted-foreground">
              {ratingAvg.toFixed(1)} / 5 · {reviewCount}
            </span>
          )}
        </div>

        <ProductReviewForm
          productId={product.id}
          isAuthed={isAuthed}
          isOwner={isOwner}
          loginHref={`/${lang}/login?callbackUrl=/${lang}/u/${username}/products/${id}`}
          existing={viewerReview}
          dict={dict}
        />

        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {dict.products.empty.replace("Продуктов", "Отзывов")}
          </p>
        ) : (
          <ul className="space-y-3">
            {reviews.map((r) => (
              <li key={r.id}>
                <Card>
                  <CardContent className="py-4 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="text-amber-500">
                        {"★".repeat(r.rating)}
                        <span className="text-muted-foreground/40">
                          {"★".repeat(5 - r.rating)}
                        </span>
                      </span>
                      {r.author && (
                        <Link
                          href={`/${lang}/u/${r.author.username}`}
                          className="text-foreground font-medium hover:underline underline-offset-2"
                        >
                          @{r.author.username}
                        </Link>
                      )}
                      <span className="text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString(
                          lang === "ru" ? "ru-RU" : "en-US",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 whitespace-pre-line">
                      {r.body}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
