import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  lang: Locale;
  dict: Dictionary;
  entity: {
    slug: string;
    title: string;
    kind: "word" | "person";
    descriptionWiki: string;
    interpretationCount: number;
    tags: string[];
  };
};

export function EntityCard({ lang, dict, entity }: Props) {
  const kindLabel =
    entity.kind === "word" ? dict.entities.kindWord : dict.entities.kindPerson;

  return (
    <Card className="group hover:border-foreground/40 transition-colors">
      <Link href={`/${lang}/entities/${entity.slug}`} className="contents">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs font-normal">
              {kindLabel}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              {dict.entities.interpretationsCount(entity.interpretationCount)}
            </span>
          </div>
          <h3 className="font-heading text-2xl tracking-tight group-hover:underline underline-offset-4 decoration-1">
            {entity.title}
          </h3>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {entity.descriptionWiki}
          </p>
          {entity.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {entity.tags.map((t) => (
                <span
                  key={t}
                  className="text-[11px] text-muted-foreground/80 font-mono"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
