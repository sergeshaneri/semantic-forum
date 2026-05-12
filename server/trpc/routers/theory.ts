import { TRPCError } from "@trpc/server";
import { and, count, eq } from "drizzle-orm";
import { z } from "zod";
import {
  interpretations,
  theories,
  theoryObjects,
} from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";

const langSchema = z.enum(["ru", "en"]);
const slugSchema = z
  .string()
  .min(2)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Только латиница, цифры и дефисы");

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
          authorId: theory.authorId,
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
        columns: { id: true, slug: true, name: true, authorId: true, isSeed: true },
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

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(200),
        slug: slugSchema,
        description: z.string().min(20).max(3000),
        language: langSchema,
        parentTheorySlug: z.string().optional(),
        copyObjects: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const dupe = await ctx.db
        .select({ id: theories.id })
        .from(theories)
        .where(
          and(
            eq(theories.slug, input.slug),
            eq(theories.language, input.language),
          ),
        )
        .limit(1);
      if (dupe.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Теория с таким slug уже существует",
        });
      }

      let parentId: string | null = null;
      type SourceObject = typeof theoryObjects.$inferSelect;
      let sourceObjects: SourceObject[] = [];

      if (input.parentTheorySlug) {
        const parent = await ctx.db.query.theories.findFirst({
          where: and(
            eq(theories.slug, input.parentTheorySlug),
            eq(theories.language, input.language),
          ),
        });
        if (!parent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Родительская теория не найдена",
          });
        }
        parentId = parent.id;

        if (input.copyObjects) {
          sourceObjects = await ctx.db.query.theoryObjects.findMany({
            where: eq(theoryObjects.theoryId, parent.id),
          });
        }
      }

      const [inserted] = await ctx.db
        .insert(theories)
        .values({
          name: input.name,
          slug: input.slug,
          description: input.description,
          language: input.language,
          isSeed: false,
          parentTheoryId: parentId,
          authorId: ctx.userId,
        })
        .returning({ id: theories.id, slug: theories.slug });

      const newTheoryId = inserted!.id;

      if (sourceObjects.length > 0) {
        await ctx.db.insert(theoryObjects).values(
          sourceObjects.map((o) => ({
            theoryId: newTheoryId,
            kind: o.kind,
            name: o.name,
            slug: o.slug,
            description: o.description,
            metadata: o.metadata,
            parentObjectId: null,
            position: o.position,
            language: o.language,
          })),
        );
      }

      return { id: newTheoryId, slug: inserted!.slug };
    }),

  fork: protectedProcedure
    .input(
      z.object({
        sourceSlug: z.string(),
        language: langSchema,
        newName: z.string().min(2).max(200),
        newSlug: slugSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const source = await ctx.db.query.theories.findFirst({
        where: and(
          eq(theories.slug, input.sourceSlug),
          eq(theories.language, input.language),
        ),
      });
      if (!source) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Исходная теория не найдена",
        });
      }

      const dupe = await ctx.db
        .select({ id: theories.id })
        .from(theories)
        .where(
          and(
            eq(theories.slug, input.newSlug),
            eq(theories.language, input.language),
          ),
        )
        .limit(1);
      if (dupe.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Теория с таким slug уже существует",
        });
      }

      const [forked] = await ctx.db
        .insert(theories)
        .values({
          name: input.newName,
          slug: input.newSlug,
          description: source.description ?? "",
          language: input.language,
          isSeed: false,
          parentTheoryId: source.id,
          authorId: ctx.userId,
        })
        .returning({ id: theories.id, slug: theories.slug });

      const sourceObjects = await ctx.db.query.theoryObjects.findMany({
        where: eq(theoryObjects.theoryId, source.id),
      });

      if (sourceObjects.length > 0) {
        await ctx.db.insert(theoryObjects).values(
          sourceObjects.map((o) => ({
            theoryId: forked!.id,
            kind: o.kind,
            name: o.name,
            slug: o.slug,
            description: o.description,
            metadata: o.metadata,
            parentObjectId: null,
            position: o.position,
            language: o.language,
          })),
        );
      }

      return { id: forked!.id, slug: forked!.slug };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(2).max(200),
        description: z.string().min(20).max(3000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({
          id: theories.id,
          authorId: theories.authorId,
          isSeed: theories.isSeed,
        })
        .from(theories)
        .where(eq(theories.id, input.id))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.isSeed) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Сид-теорию нельзя редактировать.",
        });
      }
      if (existing.authorId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Редактировать может только автор",
        });
      }
      await ctx.db
        .update(theories)
        .set({ name: input.name, description: input.description })
        .where(eq(theories.id, input.id));
      return { ok: true as const };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({
          id: theories.id,
          authorId: theories.authorId,
          isSeed: theories.isSeed,
        })
        .from(theories)
        .where(eq(theories.id, input.id))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.isSeed) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Сид-теорию нельзя удалить",
        });
      }
      if (existing.authorId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Удалять может только автор",
        });
      }
      const [{ c }] = await ctx.db
        .select({ c: count() })
        .from(interpretations)
        .where(eq(interpretations.theoryId, input.id));
      if (Number(c) > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "В теории уже есть интерпретации других авторов. Удалить нельзя.",
        });
      }
      await ctx.db.delete(theories).where(eq(theories.id, input.id));
      return { ok: true as const };
    }),
});
