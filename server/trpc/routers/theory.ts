import { TRPCError } from "@trpc/server";
import { and, count, eq } from "drizzle-orm";
import { z } from "zod";
import {
  interpretations,
  theories,
  theoryObjects,
} from "@/server/db/schema";
import { createTRPCRouter, publicProcedure } from "../init";

const langSchema = z.enum(["ru", "en"]);

export const theoryRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({ language: langSchema }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.query.theories.findMany({
        where: eq(theories.language, input.language),
        with: {
          author: { columns: { id: true, username: true, name: true } },
          parent: { columns: { id: true, name: true, slug: true } },
          objects: { columns: { id: true } },
          forks: { columns: { id: true } },
        },
      });

      return rows.map((t) => ({
        id: t.id,
        slug: t.slug,
        name: t.name,
        description: t.description ?? "",
        isSeed: t.isSeed,
        ratingAvg: t.ratingAvg,
        forkCount: t.forks.length,
        objectCount: t.objects.length,
        author: t.author
          ? {
              id: t.author.id,
              username: t.author.username ?? "",
              name: t.author.name ?? "",
            }
          : null,
        parentTheory: t.parent
          ? { id: t.parent.id, name: t.parent.name, slug: t.parent.slug }
          : null,
      }));
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string(), language: langSchema }))
    .query(async ({ ctx, input }) => {
      const theory = await ctx.db.query.theories.findFirst({
        where: and(
          eq(theories.slug, input.slug),
          eq(theories.language, input.language),
        ),
        with: {
          author: { columns: { id: true, username: true, name: true } },
          parent: { columns: { id: true, name: true, slug: true } },
          forks: { columns: { id: true } },
          objects: true,
        },
      });

      if (!theory) throw new TRPCError({ code: "NOT_FOUND" });

      const [interpCount] = await ctx.db
        .select({ count: count() })
        .from(interpretations)
        .where(eq(interpretations.theoryId, theory.id));

      return {
        theory: {
          id: theory.id,
          slug: theory.slug,
          name: theory.name,
          description: theory.description ?? "",
          isSeed: theory.isSeed,
          ratingAvg: theory.ratingAvg,
          forkCount: theory.forks.length,
          author: theory.author
            ? {
                id: theory.author.id,
                username: theory.author.username ?? "",
                name: theory.author.name ?? "",
                karma: 0,
              }
            : null,
          parentTheory: theory.parent
            ? {
                id: theory.parent.id,
                name: theory.parent.name,
                slug: theory.parent.slug,
              }
            : null,
        },
        objects: theory.objects.map((o) => ({
          id: o.id,
          name: o.name,
          slug: o.slug,
          kind: o.kind,
          description: o.description ?? "",
          metadata: o.metadata as Record<string, unknown> | null,
        })),
        interpretationCount: interpCount?.count ?? 0,
      };
    }),

  getObjects: publicProcedure
    .input(z.object({ theoryId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const objects = await ctx.db.query.theoryObjects.findMany({
        where: eq(theoryObjects.theoryId, input.theoryId),
      });
      return objects.map((o) => ({
        id: o.id,
        slug: o.slug,
        name: o.name,
        kind: o.kind,
        description: o.description ?? "",
        metadata: o.metadata as Record<string, unknown> | null,
      }));
    }),

  getObject: publicProcedure
    .input(
      z.object({
        theorySlug: z.string(),
        objectSlug: z.string(),
        language: langSchema,
      }),
    )
    .query(async ({ ctx, input }) => {
      const theory = await ctx.db.query.theories.findFirst({
        where: and(
          eq(theories.slug, input.theorySlug),
          eq(theories.language, input.language),
        ),
        columns: { id: true, slug: true, name: true },
      });
      if (!theory) throw new TRPCError({ code: "NOT_FOUND" });

      const object = await ctx.db.query.theoryObjects.findFirst({
        where: and(
          eq(theoryObjects.theoryId, theory.id),
          eq(theoryObjects.slug, input.objectSlug),
        ),
        with: { citations: true },
      });
      if (!object) throw new TRPCError({ code: "NOT_FOUND" });

      return {
        theory,
        object: {
          id: object.id,
          slug: object.slug,
          name: object.name,
          kind: object.kind,
          description: object.description ?? "",
          metadata: object.metadata as Record<string, unknown> | null,
        },
        citations: object.citations.map((c) => ({
          id: c.id,
          authorName: c.authorName,
          sourceTitle: c.sourceTitle ?? "",
          quoteText: c.quoteText,
          pageRef: c.pageRef ?? null,
        })),
      };
    }),
});
