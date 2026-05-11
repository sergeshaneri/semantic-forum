import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { entities, interpretations } from "@/server/db/schema";
import { createTRPCRouter, publicProcedure } from "../init";

const langSchema = z.enum(["ru", "en"]);

export const entityRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        language: langSchema,
        kind: z.enum(["word", "person"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.query.entities.findMany({
        where: input.kind
          ? and(
              eq(entities.language, input.language),
              eq(entities.kind, input.kind),
            )
          : eq(entities.language, input.language),
        with: {
          interpretations: { columns: { id: true } },
        },
        orderBy: [desc(entities.createdAt)],
      });
      return rows.map((e) => ({
        id: e.id,
        slug: e.slug,
        title: e.title,
        kind: e.kind,
        descriptionWiki: e.descriptionWiki ?? "",
        tags: [] as string[],
        interpretationCount: e.interpretations.length,
      }));
    }),

  popular: publicProcedure
    .input(z.object({ language: langSchema, limit: z.number().default(4) }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.query.entities.findMany({
        where: eq(entities.language, input.language),
        with: {
          interpretations: { columns: { id: true } },
        },
      });
      return rows
        .map((e) => ({
          id: e.id,
          slug: e.slug,
          title: e.title,
          kind: e.kind,
          descriptionWiki: e.descriptionWiki ?? "",
          tags: [] as string[],
          interpretationCount: e.interpretations.length,
        }))
        .sort((a, b) => b.interpretationCount - a.interpretationCount)
        .slice(0, input.limit);
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string(), language: langSchema }))
    .query(async ({ ctx, input }) => {
      const entity = await ctx.db.query.entities.findFirst({
        where: and(
          eq(entities.slug, input.slug),
          eq(entities.language, input.language),
        ),
        with: {
          interpretations: {
            orderBy: [desc(interpretations.score)],
            with: {
              theory: {
                columns: { id: true, name: true, slug: true },
              },
              theoryObject: {
                columns: {
                  id: true,
                  name: true,
                  slug: true,
                  metadata: true,
                },
              },
              author: {
                columns: { id: true, username: true, name: true },
              },
              comments: {
                with: {
                  author: {
                    columns: { id: true, username: true, name: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!entity) throw new TRPCError({ code: "NOT_FOUND" });

      return {
        entity: {
          id: entity.id,
          slug: entity.slug,
          title: entity.title,
          kind: entity.kind,
          descriptionWiki: entity.descriptionWiki ?? "",
          tags: [] as string[],
        },
        interpretations: entity.interpretations.map((i) => ({
          id: i.id,
          body: i.body,
          votesUp: i.votesUp,
          votesDown: i.votesDown,
          score: i.score,
          theory: i.theory,
          theoryObject: i.theoryObject
            ? {
                id: i.theoryObject.id,
                name: i.theoryObject.name,
                slug: i.theoryObject.slug,
                metadata: i.theoryObject.metadata as
                  | Record<string, unknown>
                  | null,
              }
            : null,
          author: i.author
            ? {
                id: i.author.id,
                username: i.author.username ?? "",
                name: i.author.name ?? "",
                karma: 0,
              }
            : null,
          comments: i.comments.map((c) => ({
            id: c.id,
            body: c.body,
            stance: c.stance,
            votesUp: c.votesUp,
            votesDown: c.votesDown,
            author: c.author
              ? {
                  id: c.author.id,
                  username: c.author.username ?? "",
                  name: c.author.name ?? "",
                }
              : null,
          })),
        })),
      };
    }),
});
