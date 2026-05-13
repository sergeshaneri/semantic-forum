import { and, eq, inArray, or, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { entities, theories, theoryObjects, users } from "@/server/db/schema";

/**
 * Wiki-style citations resolve `[[Token]]` or `[[Token|alias]]` to links.
 *
 * Token forms:
 *   - `Plain Title`        — entity, then theory by name/slug
 *   - `#object-slug`       — theory object by slug
 *   - `@username`          — user profile
 *
 * Misses are left as raw text.
 */

const CITATION_RE = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

type Lang = "ru" | "en";

type ParsedToken =
  | { kind: "entity"; key: string }
  | { kind: "object"; key: string }
  | { kind: "user"; key: string };

function parseToken(raw: string): ParsedToken {
  const trimmed = raw.trim();
  if (trimmed.startsWith("@")) {
    return { kind: "user", key: trimmed.slice(1).toLowerCase() };
  }
  if (trimmed.startsWith("#")) {
    return { kind: "object", key: trimmed.slice(1).toLowerCase() };
  }
  return { kind: "entity", key: trimmed.toLowerCase() };
}

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

  const tokens: ParsedToken[] = [];
  {
    let m: RegExpExecArray | null;
    while ((m = CITATION_RE.exec(body)) !== null) {
      tokens.push(parseToken(m[1]!));
    }
  }
  if (tokens.length === 0) return body;

  const entityKeys = Array.from(
    new Set(tokens.filter((t) => t.kind === "entity").map((t) => t.key)),
  );
  const objectKeys = Array.from(
    new Set(tokens.filter((t) => t.kind === "object").map((t) => t.key)),
  );
  const userKeys = Array.from(
    new Set(tokens.filter((t) => t.kind === "user").map((t) => t.key)),
  );

  const entitySlugByKey = new Map<string, string>();
  const theorySlugByKey = new Map<string, string>();
  const objectByKey = new Map<
    string,
    { slug: string; theorySlug: string; name: string }
  >();
  const userByKey = new Map<string, { username: string; name: string }>();

  if (entityKeys.length > 0) {
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
            sql`lower(${entities.title}) = ANY(${entityKeys})`,
            inArray(entities.slug, entityKeys),
          ),
        ),
      )
      .limit(100);
    for (const e of ents) {
      entitySlugByKey.set(e.title.toLowerCase(), e.slug);
      entitySlugByKey.set(e.slug.toLowerCase(), e.slug);
    }
    const missing = entityKeys.filter((k) => !entitySlugByKey.has(k));
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
      for (const t of ths) {
        theorySlugByKey.set(t.name.toLowerCase(), t.slug);
        theorySlugByKey.set(t.slug.toLowerCase(), t.slug);
      }
    }
  }

  if (objectKeys.length > 0) {
    const objs = await db.query.theoryObjects.findMany({
      where: (o, { and: a, eq: e, inArray: i }) =>
        a(e(o.language, language), i(o.slug, objectKeys)),
      with: { theory: { columns: { slug: true } } },
      limit: 100,
    });
    for (const o of objs) {
      if (!o.theory) continue;
      objectByKey.set(o.slug.toLowerCase(), {
        slug: o.slug,
        theorySlug: o.theory.slug,
        name: o.name,
      });
    }
  }

  if (userKeys.length > 0) {
    const us = await db
      .select({ username: users.username, name: users.name })
      .from(users)
      .where(sql`lower(${users.username}) = ANY(${userKeys})`)
      .limit(100);
    for (const u of us) {
      if (!u.username) continue;
      userByKey.set(u.username.toLowerCase(), {
        username: u.username,
        name: u.name ?? "",
      });
    }
  }

  return body.replace(CITATION_RE, (_full, rawTitle: string, alias?: string) => {
    const token = parseToken(rawTitle);
    const display = (alias ?? rawTitle).trim();

    if (token.kind === "user") {
      const u = userByKey.get(token.key);
      if (u) {
        const label = alias ? display : `@${u.username}`;
        return `[${label}](/${language}/u/${u.username})`;
      }
      return `[[${rawTitle}${alias ? `|${alias}` : ""}]]`;
    }

    if (token.kind === "object") {
      const o = objectByKey.get(token.key);
      if (o) {
        const label = alias ? display : o.name;
        return `[${label}](/${language}/theories/${o.theorySlug}/objects/${o.slug})`;
      }
      return `[[${rawTitle}${alias ? `|${alias}` : ""}]]`;
    }

    const entitySlug = entitySlugByKey.get(token.key);
    if (entitySlug) {
      return `[${display}](/${language}/entities/${entitySlug})`;
    }
    const theorySlug = theorySlugByKey.get(token.key);
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
  const allBodies = bodies.filter(Boolean) as string[];
  if (allBodies.length === 0) return bodies.map((b) => b ?? "");
  return Promise.all(bodies.map((b) => expandCitations(b ?? "", language)));
}
