import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/trpc/server";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  lang: Locale;
  dict: Dictionary;
};

function getSymbol(metadata: Record<string, unknown> | null | undefined) {
  if (metadata && typeof metadata === "object" && "symbol" in metadata) {
    const v = (metadata as { symbol?: unknown }).symbol;
    return typeof v === "string" ? v : null;
  }
  return null;
}

export async function Trending({ lang, dict }: Props) {
  const items = await api.trending.interpretations({
    language: lang,
    days: 7,
    limit: 5,
  });
  if (items.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-2xl font-semibold tracking-tight">
        {dict.trending.title}
      </h2>
      <p className="text-sm text-muted-foreground">{dict.trending.subtitle}</p>
      <ul className="space-y-2">
        {items.map((i) => {
          const symbol = getSymbol(i.theoryObject?.metadata);
          return (
            <li key={i.id}>
              <Card>
                <CardContent className="py-3 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                    <span className="font-mono font-semibold text-foreground">
                      +{i.score}
                    </span>
                    {i.author && (
                      <>
                        <Link
                          href={`/${lang}/u/${i.author.username}`}
                          className="text-foreground hover:underline underline-offset-2"
                        >
                          @{i.author.username}
                        </Link>
                        <span>·</span>
                      </>
                    )}
                    {i.entity && (
                      <Link
                        href={`/${lang}/entities/${i.entity.slug}`}
                        className="text-foreground hover:underline underline-offset-2"
                      >
                        {i.entity.title}
                      </Link>
                    )}
                    {i.theoryObject && (
                      <>
                        <span>·</span>
                        <span className="font-mono inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-foreground/5">
                          {symbol && (
                            <span className="font-semibold">{symbol}</span>
                          )}
                          <span>{i.theoryObject.name}</span>
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-foreground/90 line-clamp-2 leading-relaxed">
                    {i.body}
                  </p>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
