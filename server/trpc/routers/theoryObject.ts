import { TRPCError } from "@trpc/server";
import { and, count, eq } from "drizzle-orm";
import { z } from "zod";
import { interpretations, theories, theoryObjects } from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../init";

const kindSchema = z.enum([
  "aspect",
  "function_position",
  "type",
  "intertype_relation",
  "dichotomy",
  "custom",
]);

const slugSchema = z
  .string()
  .min(2)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Только латиница, цифры и дефисы");

async function assertTheoryOwner(
  db: typeof import("@/server/db").db,
  theoryId: string,
  userId: string,
) {
  const [t] = await db
    .select({ id: theories.id, authorId: theories.authorId, isSeed: theories.isSeed })
    .from(theories)
    .where(eq(theories.id, theoryId))
    .limit(1);
  if (!t) throw new TRPCError({ code: "NOT_FOUND", message: "Теория не найдена" });
  if (t.isSeed && !t.authorId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Сид-теорию нельзя редактировать. Сделай форк и работай в нём.",
    });
  }
  if (t.authorId !== userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Редактировать может только автор теории",
    });
  }
}

export const theoryObjectRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        theoryId: z.string().uuid(),
        kind: kindSchema,
        name: z.string().min(1).max(200),
        slug: slugSchema,
        description: z.string().min(10).max(5000),
        language: z.enum(["ru", "en"]),
        metadata: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertTheoryOwner(ctx.db, input.theoryId, ctx.userId);

      const dupe = await ctx.db
        .select({ id: theoryObjects.id })
        .from(theoryObjects)
        .where(
          and(
            eq(theoryObjects.theoryId, input.theoryId),
            eq(theoryObjects.slug, input.slug),
          ),
        )
        .limit(1);
      if (dupe.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Объект с таким slug уже есть в теории",
        });
      }

      const [inserted] = await ctx.db
        .insert(theoryObjects)
        .values({
          theoryId: input.theoryId,
          kind: input.kind,
          name: input.name,
          slug: input.slug,
          description: input.description,
          metadata: input.metadata ?? null,
          language: input.language,
        })
        .returning({ id: theoryObjects.id, slug: theoryObjects.slug });
      return { id: inserted!.id, slug: inserted!.slug };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(200),
        description: z.string().min(10).max(5000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [obj] = await ctx.db
        .select({ id: theoryObjects.id, theoryId: theoryObjects.theoryId })
        .from(theoryObjects)
        .where(eq(theoryObjects.id, input.id))
        .limit(1);
      if (!obj) throw new TRPCError({ code: "NOT_FOUND" });
      await assertTheoryOwner(ctx.db, obj.theoryId, ctx.userId);

      await ctx.db
        .update(theoryObjects)
        .set({ name: input.name, description: input.description })
        .where(eq(theoryObjects.id, input.id));
      return { ok: true as const };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [obj] = await ctx.db
        .select({ id: theoryObjects.id, theoryId: theoryObjects.theoryId })
        .from(theoryObjects)
        .where(eq(theoryObjects.id, input.id))
        .limit(1);
      if (!obj) throw new TRPCError({ code: "NOT_FOUND" });
      await assertTheoryOwner(ctx.db, obj.theoryId, ctx.userId);

      const [{ c }] = await ctx.db
        .select({ c: count() })
        .from(interpretations)
        .where(eq(interpretations.theoryObjectId, input.id));
      if (Number(c) > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "На этот объект уже есть интерпретации. Удалить нельзя — отвлечёт работу других.",
        });
      }
      await ctx.db.delete(theoryObjects).where(eq(theoryObjects.id, input.id));
      return { ok: true as const };
    }),
});
