import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { VoteWidget } from "@/components/socionics/vote-widget";
import { StanceBadge } from "@/components/socionics/stance-badge";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

type Author = { username: string; name: string; karma: number } | null;
type Theory = { name: string; slug: string } | null;
type TheoryObject = {
  name: string;
  slug: string;
  metadata: Record<string, unknown> | null | undefined;
} | null;

type Comment = {
  id: string;
  body: string;
  stance: "pro" | "contra" | "neutral";
  votesUp: number;
  votesDown: number;
  authorId: string;
};

type Props = {
  lang: Locale;
  dict: Dictionary;
  interpretation: {
    id: string;
    body: string;
    score: number;
    votesUp: number;
    votesDown: number;
    theory: Theory;
    theoryObject: TheoryObject;
    author: Author;
    comments: Comment[];
  };
  authorsLookup?: Record<string, { username: string; name: string }>;
};

function getSymbol(metadata: Record<string, unknown> | null | undefined) {
  if (metadata && typeof metadata === "object" && "symbol" in metadata) {
    const v = (metadata as { symbol?: unknown }).symbol;
    return typeof v === "string" ? v : null;
  }
  return null;
}

export function InterpretationCard({
  lang,
  dict,
  interpretation: i,
  authorsLookup = {},
}: Props) {
  const symbol = getSymbol(i.theoryObject?.metadata);

  const stanceLabel = (s: Comment["stance"]) =>
    s === "pro"
      ? dict.interpretation.stancePro
      : s === "contra"
        ? dict.interpretation.stanceContra
        : dict.interpretation.stanceNeutral;

  return (
    <Card className="overflow-hidden">
      <div className="flex">
        <div className="flex-shrink-0 border-r border-border px-3 py-5 flex items-start">
          <VoteWidget
            score={i.score}
            votesUp={i.votesUp}
            votesDown={i.votesDown}
          />
        </div>
        <div className="flex-1 min-w-0">
          <CardContent className="space-y-4 pt-5">
            <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
              {i.author && (
                <>
                  <span className="text-foreground font-medium">
                    @{i.author.username}
                  </span>
                  <span className="text-muted-foreground/60">
                    · {i.author.karma} {dict.interpretation.karma}
                  </span>
                </>
              )}
              <span className="text-muted-foreground/40">·</span>
              {i.theoryObject && (
                <Link
                  href={
                    i.theory
                      ? `/${lang}/theories/${i.theory.slug}/objects/${i.theoryObject.slug}`
                      : "#"
                  }
                  className="font-mono inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-foreground/5 hover:bg-foreground/10 transition-colors"
                >
                  {symbol && (
                    <span className="font-semibold text-foreground">
                      {symbol}
                    </span>
                  )}
                  <span>{i.theoryObject.name}</span>
                </Link>
              )}
              {i.theory && (
                <>
                  <span className="text-muted-foreground/40">
                    {dict.interpretation.inTheory}
                  </span>
                  <Link
                    href={`/${lang}/theories/${i.theory.slug}`}
                    className="hover:text-foreground underline underline-offset-2 decoration-1 decoration-muted-foreground/40"
                  >
                    {i.theory.name}
                  </Link>
                </>
              )}
            </div>
            <p className="text-[15px] leading-relaxed text-foreground whitespace-pre-line">
              {i.body}
            </p>
          </CardContent>
          {i.comments.length > 0 && (
            <CardFooter className="border-t border-border/60 bg-muted/30 flex-col items-stretch gap-3 py-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground/80 font-medium">
                {i.comments.length} {dict.interpretation.comments}
              </div>
              <ul className="space-y-3">
                {i.comments.map((c) => {
                  const author = authorsLookup[c.authorId];
                  return (
                    <li
                      key={c.id}
                      className="flex items-start gap-3 text-sm leading-relaxed"
                    >
                      <VoteWidget
                        score={c.votesUp - c.votesDown}
                        votesUp={c.votesUp}
                        votesDown={c.votesDown}
                        size="sm"
                        className="flex-shrink-0 pt-0.5"
                      />
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {author && (
                            <span className="font-medium text-foreground">
                              @{author.username}
                            </span>
                          )}
                          <StanceBadge
                            stance={c.stance}
                            label={stanceLabel(c.stance)}
                          />
                        </div>
                        <p className="text-foreground/90">{c.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardFooter>
          )}
        </div>
      </div>
    </Card>
  );
}
