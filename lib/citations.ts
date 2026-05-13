import { and, eq, inArray, or, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { entities, theories } from "@/server/db/schema";

/**
 * Wiki-style citations: `[[Title]]` or `[[Title|alias]]` auto-link to
 * entities (or theories as a fallback) in the same language. Misses are
 * left as plain text.
 */

const CITATION_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

type Lang = "ru" | "en";

export function extractCitations(body: string): string[] {
  const set = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = CITATION_RE.exec(body)) !== null) {
    set.add(m[1]!.trim().toLowerCase());
  }
  return Array.from(set);
}

export async function expandCitations(
  body: string | null | undefined,
  language: Lang,
): Promise<string> {
  if (!body) return body ?? "";
  const titles = extractCitations(body);
  if (titles.length === 0) return body;

  // Look up entities by lowercased title or slug
  const ents = await db
    .select({
      title: entities.title,
      slug: entities.slug,
    })
    .from(entities)
    .where(
      and(
        eq(entities.language, language),
        or(
          sql`lower(${entities.title}) = ANY(${titles})`,
          inArray(entities.slug, titles),
        ),
      ),
    )
    .limit(100);

  const entitySlugByKey = new Map<string, string>();
  for (const e of ents) {
    entitySlugByKey.set(e.title.toLowerCase(), e.slug);
    entitySlugByKey.set(e.slug.toLowerCase(), e.slug);
  }

  // Fallback: look up theories
  const missing = titles.filter((t) => !entitySlugByKey.has(t));
  let theorySlugByKey = new Map<string, string>();
  if (missing.length > 0) {
    const ths = await db
      .select({ name: theories.name, slug: theories.slug })
      .from(theories)
      .where(
        and(
          eq(theories.language, language),
          or(
            sql`lower(${theories.name}) = ANY(${missing})`,
            inArray(theories.slug, missing),
          ),
        ),
      )
      .limit(50);
    theorySlugByKey = new Map();
    for (const t of ths) {
      theorySlugByKey.set(t.name.toLowerCase(), t.slug);
      theorySlugByKey.set(t.slug.toLowerCase(), t.slug);
    }
  }

  return body.replace(CITATION_RE, (_full, rawTitle: string, alias?: string) => {
    const key = rawTitle.trim().toLowerCase();
    const display = (alias ?? rawTitle).trim();
    const entitySlug = entitySlugByKey.get(key);
    if (entitySlug) {
      return `[${display}](/${language}/entities/${entitySlug})`;
    }
    const theorySlug = theorySlugByKey.get(key);
    if (theorySlug) {
      return `[${display}](/${language}/theories/${theorySlug})`;
    }
    return `[[${rawTitle}${alias ? `|${alias}` : ""}]]`;
  });
}

export async function expandCitationsMany<T extends string | null | undefined>(
  bodies: T[],
  language: Lang,
): Promise<string[]> {
  // Aggregate all citations once for batch efficiency
  const allBodies = bodies.filter(Boolean) as string[];
  if (allBodies.length === 0) return bodies.map((b) => b ?? "");
  // We still resolve once per body — DB call repeats but cheap. Keep simple.
  return Promise.all(bodies.map((b) => expandCitations(b ?? "", language)));
}
