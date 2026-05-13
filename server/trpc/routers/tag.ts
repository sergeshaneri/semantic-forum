import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import {
  entities,
  entityTags,
  publicationTags,
  publications,
  tags,
} from "@/server/db/schema";
import { createTRPCRouter, publicProcedure } from "../init";

const langSchema = z.enum(["ru", "en"]);

export const tagRouter = createTRPCRouter({
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string(), language: langSchema }))
    .query(async ({ ctx, input }) => {
      const [tag] = await ctx.db
        .select({
          id: tags.id,
          slug: tags.slug,
          label: tags.label,
          language: tags.language,
        })
        .from(tags)
        .where(and(eq(tags.slug, input.slug), eq(tags.language, input.language)))
        .limit(1);
      if (!tag) throw new TRPCError({ code: "NOT_FOUND" });

      // Entities with this tag
      const entityRows = await ctx.db
        .select({ entityId: entityTags.entityId })
        .from(entityTags)
        .where(eq(entityTags.tagId, tag.id));
      const entityIds = entityRows.map((r) => r.entityId);
      const taggedEntities =
        entityIds.length > 0
          ? await ctx.db
              .select({
                id: entities.id,
                slug: entities.slug,
                title: entities.title,
                kind: entities.kind,
              })
              .from(entities)
              .where(inArray(entities.id, entityIds))
              .orderBy(desc(entities.createdAt))
          : [];

      // Publications with this tag
      const pubRows = await ctx.db
        .select({ publicationId: publicationTags.publicationId })
        .from(publicationTags)
        .where(eq(publicationTags.tagId, tag.id));
      const pubIds = pubRows.map((r) => r.publicationId);
      const taggedPubs =
        pubIds.length > 0
          ? await ctx.db.query.publications.findMany({
              where: (p, { inArray: ia }) => ia(p.id, pubIds),
              orderBy: [desc(publications.createdAt)],
              with: {
                author: { columns: { username: true, name: true } },
              },
            })
          : [];

      return {
        tag: {
          id: tag.id,
          slug: tag.slug,
          label: tag.label,
        },
        entities: taggedEntities.map((e) => ({
          id: e.id,
          slug: e.slug,
          title: e.title,
          kind: e.kind,
        })),
        publications: taggedPubs.map((p) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          kind: p.kind,
          author: p.author
            ? {
                username: p.author.username ?? "",
                name: p.author.name ?? "",
              }
            : null,
        })),
      };
    }),
});
