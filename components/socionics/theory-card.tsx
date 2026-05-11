import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { objectsCount } from "@/lib/i18n/formatters";
import type { Locale } from "@/lib/i18n/config";

type Props = {
  lang: Locale;
  dict: Dictionary;
  theory: {
    slug: string;
    name: string;
    description: string;
    isSeed: boolean;
    forkCount: number;
    objectCount: number;
    parentTheory: { name: string; slug: string } | null;
    author: { name: string; username: string } | null;
  };
};

export function TheoryCard({ lang, dict, theory }: Props) {
  return (
    <Card className="group hover:border-foreground/40 transition-colors">
      <Link href={`/${lang}/theories/${theory.slug}`} className="contents">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            {theory.isSeed && (
              <Badge variant="default" className="text-xs">
                {dict.theories.seed}
              </Badge>
            )}
            {theory.parentTheory && (
              <Badge variant="outline" className="text-xs font-normal">
                ↗ {theory.parentTheory.name}
              </Badge>
            )}
            <span className="ml-auto text-xs text-muted-foreground font-mono">
              {objectsCount(theory.objectCount, lang)} ·{" "}
              {theory.forkCount} {dict.theories.forks}
            </span>
          </div>
          <h3 className="font-heading text-2xl tracking-tight group-hover:underline underline-offset-4 decoration-1">
            {theory.name}
          </h3>
          {theory.author && (
            <p className="text-xs text-muted-foreground">
              @{theory.author.username}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {theory.description}
          </p>
        </CardContent>
      </Link>
    </Card>
  );
}
