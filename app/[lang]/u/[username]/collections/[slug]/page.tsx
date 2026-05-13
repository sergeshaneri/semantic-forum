import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { api } from "@/lib/trpc/server";

export const dynamic = "force-dynamic";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ lang: string; username: string; slug: string }>;
}) {
  const { lang, username, slug } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  let data;
  try {
    data = await api.collection.getBySlug({ username, slug });
  } catch {
    notFound();
  }

  const { owner, collection, items } = data;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <Link
        href={`/${lang}/u/${owner.username}`}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
      >
        {dict.collections.backToOwner} @{owner.username}
      </Link>

      <header className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
          {!collection.isPublic && (
            <Badge variant="outline" className="text-xs">
              🔒 {dict.collections.privateLabel}
            </Badge>
          )}
          <span className="font-mono">
            {items.length} {dict.collections.itemsShort}
          </span>
        </div>
        <h1 className="font-heading text-4xl font-semibold tracking-tight">
          {collection.name}
        </h1>
        {collection.description && (
          <p className="text-base text-muted-foreground leading-relaxed">
            {collection.description}
          </p>
        )}
      </header>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {dict.bookmarks.empty}
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={`${it.targetType}-${it.targetId}`}>
              <Link
                href={it.href}
                className="block rounded-md border border-border px-3 py-2.5 hover:bg-muted/50 transition-colors space-y-1"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs font-normal">
                    {dict.bookmarks.types[
                      it.targetType as keyof typeof dict.bookmarks.types
                    ] ?? it.targetType}
                  </Badge>
                  {it.subtitle && (
                    <span className="text-xs text-muted-foreground">
                      {it.subtitle}
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground">{it.title}</p>
                {it.note && (
                  <p className="text-xs text-muted-foreground italic">
                    {it.note}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
