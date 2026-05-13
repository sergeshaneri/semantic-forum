import { ilike, or, sql } from "drizzle-orm";
import { z } from "zod";
import {
  entities,
  groupPosts,
  groups,
  polls,
  publications,
  questions,
  theories,
  users,
} from "@/server/db/schema";
import { createTRPCRouter, publicProcedure } from "../init";

export const searchRouter = createTRPCRouter({
  global: publicProcedure
    .input(
      z.object({
        q: z.string().min(1).max(120),
        language: z.enum(["ru", "en"]),
        limit: z.number().default(8),
      }),
    )
    .query(async ({ ctx, input }) => {
      const q = `%${input.q.trim()}%`;

      const [ents, theors, pubs, usrs, qst, pls, grps, gposts] =
        await Promise.all([
          ctx.db
            .select({
              id: entities.id,
              slug: entities.slug,
              title: entities.title,
              kind: entities.kind,
              descriptionWiki: entities.descriptionWiki,
            })
            .from(entities)
            .where(
              sql`${entities.language} = ${input.language} AND (${entities.title} ILIKE ${q} OR ${entities.descriptionWiki} ILIKE ${q})`,
            )
            .limit(input.limit),
          ctx.db
            .select({
              id: theories.id,
              slug: theories.slug,
              name: theories.name,
              description: theories.description,
              isSeed: theories.isSeed,
            })
            .from(theories)
            .where(
              sql`${theories.language} = ${input.language} AND (${theories.name} ILIKE ${q} OR ${theories.description} ILIKE ${q})`,
            )
            .limit(input.limit),
          ctx.db
            .select({
              id: publications.id,
              slug: publications.slug,
              title: publications.title,
              kind: publications.kind,
              authorId: publications.authorId,
            })
            .from(publications)
            .where(
              sql`${publications.language} = ${input.language} AND (${publications.title} ILIKE ${q} OR ${publications.body} ILIKE ${q})`,
            )
            .limit(input.limit),
          ctx.db
            .select({
              id: users.id,
              username: users.username,
              name: users.name,
              bio: users.bio,
            })
            .from(users)
            .where(
              or(
                ilike(users.username, q),
                ilike(users.name, q),
                ilike(users.bio, q),
              ),
            )
            .limit(input.limit),
          ctx.db
            .select({
              id: questions.id,
              slug: questions.slug,
              title: questions.title,
              body: questions.body,
              isResolved: questions.isResolved,
            })
            .from(questions)
            .where(
              sql`${questions.language} = ${input.language} AND (${questions.title} ILIKE ${q} OR ${questions.body} ILIKE ${q})`,
            )
            .limit(input.limit),
          ctx.db
            .select({
              id: polls.id,
              slug: polls.slug,
              question: polls.question,
              description: polls.description,
            })
            .from(polls)
            .where(
              sql`${polls.language} = ${input.language} AND (${polls.question} ILIKE ${q} OR ${polls.description} ILIKE ${q})`,
            )
            .limit(input.limit),
          ctx.db
            .select({
              id: groups.id,
              slug: groups.slug,
              name: groups.name,
              description: groups.description,
              isPrivate: groups.isPrivate,
            })
            .from(groups)
            .where(
              sql`${groups.language} = ${input.language} AND ${groups.isPrivate} = false AND (${groups.name} ILIKE ${q} OR ${groups.description} ILIKE ${q})`,
            )
            .limit(input.limit),
          ctx.db
            .select({
              id: groupPosts.id,
              slug: groupPosts.slug,
              title: groupPosts.title,
              body: groupPosts.body,
              groupId: groupPosts.groupId,
            })
            .from(groupPosts)
            .where(
              sql`${groupPosts.language} = ${input.language} AND (${groupPosts.title} ILIKE ${q} OR ${groupPosts.body} ILIKE ${q})`,
            )
            .limit(input.limit),
        ]);

      // For publications, fetch author usernames
      const authorIds = Array.from(new Set(pubs.map((p) => p.authorId)));
      const authors =
        authorIds.length > 0
          ? await ctx.db.query.users.findMany({
              where: (u, { inArray }) => inArray(u.id, authorIds),
              columns: { id: true, username: true },
            })
          : [];
      const authorMap = new Map(authors.map((a) => [a.id, a.username ?? ""]));

      // For group posts, resolve group slug (skip private groups)
      const postGroupIds = Array.from(new Set(gposts.map((p) => p.groupId)));
      const postGroups =
        postGroupIds.length > 0
          ? await ctx.db
              .select({
                id: groups.id,
                slug: groups.slug,
                isPrivate: groups.isPrivate,
              })
              .from(groups)
              .where(
                sql`${groups.id} IN (${sql.join(
                  postGroupIds.map((id) => sql`${id}`),
                  sql`, `,
                )}) AND ${groups.isPrivate} = false`,
              )
          : [];
      const groupSlugMap = new Map(postGroups.map((g) => [g.id, g.slug]));

      return {
        entities: ents.map((e) => ({
          id: e.id,
          slug: e.slug,
          title: e.title,
          kind: e.kind,
          subtitle: e.descriptionWiki
            ? e.descriptionWiki.slice(0, 100)
            : null,
        })),
        theories: theors.map((t) => ({
          id: t.id,
          slug: t.slug,
          name: t.name,
          isSeed: t.isSeed,
          subtitle: t.description ? t.description.slice(0, 100) : null,
        })),
        publications: pubs.map((p) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          kind: p.kind,
          authorUsername: authorMap.get(p.authorId) ?? "",
        })),
        users: usrs.map((u) => ({
          id: u.id,
          username: u.username ?? "",
          name: u.name ?? "",
          subtitle: u.bio ? u.bio.slice(0, 100) : null,
        })),
        questions: qst.map((q) => ({
          id: q.id,
          slug: q.slug,
          title: q.title,
          isResolved: q.isResolved,
          subtitle: q.body ? q.body.slice(0, 100) : null,
        })),
        polls: pls.map((p) => ({
          id: p.id,
          slug: p.slug,
          question: p.question,
          subtitle: p.description ? p.description.slice(0, 100) : null,
        })),
        groups: grps.map((g) => ({
          id: g.id,
          slug: g.slug,
          name: g.name,
          subtitle: g.description ? g.description.slice(0, 100) : null,
        })),
        groupPosts: gposts
          .filter((p) => groupSlugMap.has(p.groupId))
          .map((p) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            groupSlug: groupSlugMap.get(p.groupId) ?? "",
            subtitle: p.body ? p.body.slice(0, 100) : null,
          })),
      };
    }),
});
