import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import {
  entities,
  interpretations,
  theories,
  votes,
} from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";

const langSchema = z.enum(["ru", "en"]);
const slugSchema = z
  .string()
  .min(2, "Минимум 2 символа")
  .max(80, "Максимум 80 символов")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Только латиница, цифры и дефисы");

export const entityRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z
        .object({
          kind: z.enum(["word", "person", "material"]),
          title: z.string().min(1).max(300),
          slug: slugSchema,
          descriptionWiki: z.string().min(20).max(3000),
          language: langSchema,
          embedUrl: z.string().url().max(500).optional().or(z.literal("")),
          sourceUrl: z.string().url().max(500).optional().or(z.literal("")),
        })
        .refine(
          (v) =>
            v.kind !== "material" || (v.embedUrl && v.embedUrl.length > 0),
          {
            message: "Для материала нужна ссылка для embed",
            path: ["embedUrl"],
          },
        ),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db
        .select({ id: entities.id })
        .from(entities)
        .where(
          and(
            eq(entities.slug, input.slug),
            eq(entities.language, input.language),
          ),
        )
        .limit(1);
      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Сущность с таким slug уже существует",
        });
      }

      const [inserted] = await ctx.db
        .insert(entities)
        .values({
          kind: input.kind,
          title: input.title,
          slug: input.slug,
          descriptionWiki: input.descriptionWiki,
          embedUrl: input.embedUrl || null,
          sourceUrl: input.sourceUrl || null,
          language: input.language,
          createdBy: ctx.userId,
        })
        .returning({ id: entities.id, slug: entities.slug });

      return { id: inserted!.id, slug: inserted!.slug };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(300),
        descriptionWiki: z.string().min(20).max(3000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: entities.id, createdBy: entities.createdBy })
        .from(entities)
        .where(eq(entities.id, input.id))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.createdBy !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Редактировать может только автор",
        });
      }
      await ctx.db
        .update(entities)
        .set({ title: input.title, descriptionWiki: input.descriptionWiki })
        .where(eq(entities.id, input.id));
      return { ok: true as const };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: entities.id, createdBy: entities.createdBy })
        .from(entities)
        .where(eq(entities.id, input.id))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.createdBy !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Удалять может только автор",
        });
      }
      const [{ c }] = await ctx.db
        .select({ c: count() })
        .from(interpretations)
        .where(eq(interpretations.entityId, input.id));
      if (Number(c) > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "На сущности уже есть интерпретации — нельзя удалить чужую работу. Попроси модератора.",
        });
      }
      await ctx.db.delete(entities).where(eq(entities.id, input.id));
      return { ok: true as const };
    }),

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
    .input(
      z.object({
        slug: z.string(),
        language: langSchema,
        theorySlug: z.string().optional(),
      }),
    )
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
                columns: { id: true, slug: true, name: true },
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
                orderBy: (c, { asc }) => [asc(c.createdAt)],
              },
            },
          },
        },
      });

      if (!entity) throw new TRPCError({ code: "NOT_FOUND" });

      const allInterpretations = entity.interpretations;
      const filtered = input.theorySlug
        ? allInterpretations.filter((i) => i.theory?.slug === input.theorySlug)
        : allInterpretations;

      // theory choices for the dropdown
      const theorySet = new Map<string, { slug: string; name: string }>();
      for (const i of allInterpretations) {
        if (i.theory) {
          theorySet.set(i.theory.slug, {
            slug: i.theory.slug,
            name: i.theory.name,
          });
        }
      }
      const theoryChoices = Array.from(theorySet.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      );

      const userId = ctx.session?.user?.id ?? null;

      const interpIds = filtered.map((i) => i.id);
      const commentIds = filtered.flatMap((i) =>
        i.comments.map((c) => c.id),
      );

      const interpVotes = new Map<string, 1 | -1>();
      const commentVotes = new Map<string, 1 | -1>();

      if (userId) {
        if (interpIds.length > 0) {
          const rows = await ctx.db
            .select({ targetId: votes.targetId, value: votes.value })
            .from(votes)
            .where(
              and(
                eq(votes.userId, userId),
                eq(votes.targetType, "interpretation"),
                inArray(votes.targetId, interpIds),
              ),
            );
          for (const r of rows) {
            interpVotes.set(r.targetId, r.value as 1 | -1);
          }
        }
        if (commentIds.length > 0) {
          const rows = await ctx.db
            .select({ targetId: votes.targetId, value: votes.value })
            .from(votes)
            .where(
              and(
                eq(votes.userId, userId),
                eq(votes.targetType, "comment"),
                inArray(votes.targetId, commentIds),
              ),
            );
          for (const r of rows) {
            commentVotes.set(r.targetId, r.value as 1 | -1);
          }
        }
      }

      return {
        entity: {
          id: entity.id,
          slug: entity.slug,
          title: entity.title,
          kind: entity.kind,
          descriptionWiki: entity.descriptionWiki ?? "",
          embedUrl: entity.embedUrl,
          sourceUrl: entity.sourceUrl,
          tags: [] as string[],
          createdBy: entity.createdBy,
        },
        theoryChoices,
        interpretations: filtered.map((i) => ({
          id: i.id,
          body: i.body,
          votesUp: i.votesUp,
          votesDown: i.votesDown,
          score: i.score,
          userVote: (interpVotes.get(i.id) ?? 0) as 1 | -1 | 0,
          authorId: i.authorId,
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
            userVote: (commentVotes.get(c.id) ?? 0) as 1 | -1 | 0,
            authorId: c.authorId,
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
