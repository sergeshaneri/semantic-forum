import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import {
  entities,
  interpretationCoauthors,
  interpretationRevisions,
  interpretations,
  notifications,
  theories,
  theoryObjects,
  users,
} from "@/server/db/schema";
import { extractMentions } from "@/lib/mentions";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";

const createSchema = z.object({
  entityId: z.string().uuid(),
  theoryId: z.string().uuid(),
  theoryObjectId: z.string().uuid(),
  body: z
    .string()
    .min(20, "Минимум 20 символов")
    .max(5000, "Максимум 5000 символов"),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  theoryId: z.string().uuid(),
  theoryObjectId: z.string().uuid(),
  body: z.string().min(20).max(5000),
});

async function canEditInterpretation(
  db: typeof import("@/server/db").db,
  interpretationId: string,
  userId: string,
): Promise<{
  ok: boolean;
  row?: {
    id: string;
    authorId: string | null;
    body: string;
    theoryId: string;
    theoryObjectId: string;
  };
}> {
  const [row] = await db
    .select({
      id: interpretations.id,
      authorId: interpretations.authorId,
      body: interpretations.body,
      theoryId: interpretations.theoryId,
      theoryObjectId: interpretations.theoryObjectId,
    })
    .from(interpretations)
    .where(eq(interpretations.id, interpretationId))
    .limit(1);
  if (!row) return { ok: false };
  if (row.authorId === userId) return { ok: true, row };
  const [co] = await db
    .select({ userId: interpretationCoauthors.userId })
    .from(interpretationCoauthors)
    .where(
      and(
        eq(interpretationCoauthors.interpretationId, interpretationId),
        eq(interpretationCoauthors.userId, userId),
      ),
    )
    .limit(1);
  return { ok: Boolean(co), row };
}

export const interpretationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createSchema)
    .mutation(async ({ ctx, input }) => {
      const [entity] = await ctx.db
        .select({ id: entities.id, language: entities.language })
        .from(entities)
        .where(eq(entities.id, input.entityId))
        .limit(1);
      if (!entity) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Сущность не найдена",
        });
      }

      const [theory] = await ctx.db
        .select({ id: theories.id })
        .from(theories)
        .where(eq(theories.id, input.theoryId))
        .limit(1);
      if (!theory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Теория не найдена",
        });
      }

      const [obj] = await ctx.db
        .select({ theoryId: theoryObjects.theoryId })
        .from(theoryObjects)
        .where(eq(theoryObjects.id, input.theoryObjectId))
        .limit(1);
      if (!obj || obj.theoryId !== input.theoryId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Объект не принадлежит выбранной теории",
        });
      }

      const [inserted] = await ctx.db
        .insert(interpretations)
        .values({
          entityId: input.entityId,
          theoryId: input.theoryId,
          theoryObjectId: input.theoryObjectId,
          authorId: ctx.userId,
          body: input.body,
          language: entity.language,
        })
        .returning({ id: interpretations.id });

      // @mentions notifications
      const mentioned = extractMentions(input.body);
      if (mentioned.length > 0) {
        const slugRow = await ctx.db
          .select({ slug: entities.slug, lang: entities.language })
          .from(entities)
          .where(eq(entities.id, input.entityId))
          .limit(1);
        const url = slugRow[0]
          ? `/${slugRow[0].lang}/entities/${slugRow[0].slug}`
          : null;
        const targets = await ctx.db
          .select({ id: users.id })
          .from(users)
          .where(inArray(users.username, mentioned));
        for (const t of targets) {
          if (t.id === ctx.userId) continue;
          await ctx.db.insert(notifications).values({
            recipientId: t.id,
            actorId: ctx.userId,
            type: "mention",
            targetType: "interpretation",
            targetId: inserted!.id,
            url,
            message: "упомянул тебя в интерпретации",
          });
        }
      }

      return { id: inserted!.id };
    }),

  update: protectedProcedure
    .input(updateSchema)
    .mutation(async ({ ctx, input }) => {
      const access = await canEditInterpretation(
        ctx.db,
        input.id,
        ctx.userId,
      );
      if (!access.row) throw new TRPCError({ code: "NOT_FOUND" });
      if (!access.ok) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Редактировать может только автор или соавтор",
        });
      }
      const existing = access.row;

      const [obj] = await ctx.db
        .select({ theoryId: theoryObjects.theoryId })
        .from(theoryObjects)
        .where(eq(theoryObjects.id, input.theoryObjectId))
        .limit(1);
      if (!obj || obj.theoryId !== input.theoryId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Объект не принадлежит выбранной теории",
        });
      }

      const bodyChanged = existing.body !== input.body;
      const theoryChanged = existing.theoryId !== input.theoryId;
      const objectChanged = existing.theoryObjectId !== input.theoryObjectId;
      if (bodyChanged || theoryChanged || objectChanged) {
        await ctx.db.insert(interpretationRevisions).values({
          interpretationId: input.id,
          theoryId: existing.theoryId,
          theoryObjectId: existing.theoryObjectId,
          body: existing.body,
          editorId: ctx.userId,
        });
      }

      await ctx.db
        .update(interpretations)
        .set({
          theoryId: input.theoryId,
          theoryObjectId: input.theoryObjectId,
          body: input.body,
          updatedAt: new Date(),
        })
        .where(eq(interpretations.id, input.id));
      return { ok: true as const };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({
          id: interpretations.id,
          authorId: interpretations.authorId,
        })
        .from(interpretations)
        .where(eq(interpretations.id, input.id))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.authorId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Удалять может только автор",
        });
      }
      const [{ c }] = await ctx.db
        .select({ c: count() })
        .from(interpretations)
        .where(eq(interpretations.id, input.id));
      // hard delete cascades comments via FK
      void c;
      await ctx.db.delete(interpretations).where(eq(interpretations.id, input.id));
      return { ok: true as const };
    }),

  history: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.query.interpretationRevisions.findMany({
        where: eq(interpretationRevisions.interpretationId, input.id),
        orderBy: [desc(interpretationRevisions.createdAt)],
        with: {
          editor: {
            columns: { id: true, username: true, name: true },
          },
        },
      });
      return rows.map((r) => ({
        id: r.id,
        body: r.body,
        theoryId: r.theoryId,
        theoryObjectId: r.theoryObjectId,
        createdAt: r.createdAt,
        editor: r.editor
          ? {
              id: r.editor.id,
              username: r.editor.username ?? "",
              name: r.editor.name ?? "",
            }
          : null,
      }));
    }),

  coauthors: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.query.interpretationCoauthors.findMany({
        where: eq(interpretationCoauthors.interpretationId, input.id),
        with: {
          user: {
            columns: { id: true, username: true, name: true, image: true },
          },
        },
      });
      return rows
        .filter((r) => r.user)
        .map((r) => ({
          id: r.user!.id,
          username: r.user!.username ?? "",
          name: r.user!.name ?? "",
          image: r.user!.image ?? null,
          addedAt: r.addedAt,
        }));
    }),

  addCoauthor: protectedProcedure
    .input(z.object({ id: z.string().uuid(), username: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({
          id: interpretations.id,
          authorId: interpretations.authorId,
        })
        .from(interpretations)
        .where(eq(interpretations.id, input.id))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.authorId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Только главный автор управляет соавторами",
        });
      }
      const [target] = await ctx.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);
      if (!target) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Пользователь не найден" });
      }
      if (target.id === ctx.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Себя добавлять не нужно",
        });
      }
      try {
        await ctx.db.insert(interpretationCoauthors).values({
          interpretationId: input.id,
          userId: target.id,
        });
      } catch {
        // already a coauthor
      }
      return { ok: true as const };
    }),

  removeCoauthor: protectedProcedure
    .input(z.object({ id: z.string().uuid(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({
          id: interpretations.id,
          authorId: interpretations.authorId,
        })
        .from(interpretations)
        .where(eq(interpretations.id, input.id))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      // Allow main author OR the coauthor themselves to remove
      if (
        existing.authorId !== ctx.userId &&
        input.userId !== ctx.userId
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.db
        .delete(interpretationCoauthors)
        .where(
          and(
            eq(interpretationCoauthors.interpretationId, input.id),
            eq(interpretationCoauthors.userId, input.userId),
          ),
        );
      return { ok: true as const };
    }),
});
