import { TRPCError } from "@trpc/server";
import { count, eq } from "drizzle-orm";
import { z } from "zod";
import {
  entities,
  interpretations,
  theories,
  theoryObjects,
} from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../init";

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

      return { id: inserted!.id };
    }),

  update: protectedProcedure
    .input(updateSchema)
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
          message: "Редактировать может только автор",
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
});
