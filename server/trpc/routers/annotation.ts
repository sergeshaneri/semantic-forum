import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { annotations, entities } from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";

const langSchema = z.enum(["ru", "en"]);

export const annotationRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({ entityId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.query.annotations.findMany({
        where: eq(annotations.entityId, input.entityId),
        orderBy: [desc(annotations.createdAt)],
        with: {
          author: { columns: { id: true, username: true, name: true } },
        },
      });
      return rows.map((a) => ({
        id: a.id,
        anchorText: a.anchorText,
        startOffset: a.startOffset,
        endOffset: a.endOffset,
        body: a.body,
        createdAt: a.createdAt,
        authorId: a.authorId,
        author: a.author
          ? {
              id: a.author.id,
              username: a.author.username ?? "",
              name: a.author.name ?? "",
            }
          : null,
      }));
    }),

  create: protectedProcedure
    .input(
      z.object({
        entityId: z.string().uuid(),
        anchorText: z.string().min(1).max(1000),
        startOffset: z.number().int().min(0).optional(),
        endOffset: z.number().int().min(0).optional(),
        body: z.string().min(1).max(5000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [entity] = await ctx.db
        .select({ id: entities.id, language: entities.language })
        .from(entities)
        .where(eq(entities.id, input.entityId))
        .limit(1);
      if (!entity) throw new TRPCError({ code: "NOT_FOUND" });

      const [inserted] = await ctx.db
        .insert(annotations)
        .values({
          entityId: input.entityId,
          authorId: ctx.userId,
          anchorText: input.anchorText,
          startOffset: input.startOffset ?? null,
          endOffset: input.endOffset ?? null,
          body: input.body,
          language: entity.language,
        })
        .returning({ id: annotations.id });
      return { id: inserted!.id };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [a] = await ctx.db
        .select({ id: annotations.id, authorId: annotations.authorId })
        .from(annotations)
        .where(eq(annotations.id, input.id))
        .limit(1);
      if (!a) throw new TRPCError({ code: "NOT_FOUND" });
      if (a.authorId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.db.delete(annotations).where(eq(annotations.id, input.id));
      return { ok: true as const };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        body: z.string().min(1).max(5000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [a] = await ctx.db
        .select({ id: annotations.id, authorId: annotations.authorId })
        .from(annotations)
        .where(eq(annotations.id, input.id))
        .limit(1);
      if (!a) throw new TRPCError({ code: "NOT_FOUND" });
      if (a.authorId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.db
        .update(annotations)
        .set({ body: input.body, updatedAt: new Date() })
        .where(eq(annotations.id, input.id));
      return { ok: true as const };
    }),
});
