import { TRPCError } from "@trpc/server";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import {
  comments,
  interpretations,
  notifications,
  users,
} from "@/server/db/schema";
import { extractMentions } from "@/lib/mentions";
import { createTRPCRouter, protectedProcedure } from "../init";

const stanceSchema = z.enum(["pro", "contra", "neutral"]);

export const commentRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        interpretationId: z.string().uuid(),
        body: z
          .string()
          .min(2, "Минимум 2 символа")
          .max(2000, "Максимум 2000 символов"),
        stance: stanceSchema,
        parentCommentId: z.string().uuid().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [interp] = await ctx.db
        .select({
          id: interpretations.id,
          authorId: interpretations.authorId,
          entityId: interpretations.entityId,
          language: interpretations.language,
        })
        .from(interpretations)
        .where(eq(interpretations.id, input.interpretationId))
        .limit(1);
      if (!interp) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (input.parentCommentId) {
        const [parent] = await ctx.db
          .select({
            id: comments.id,
            interpretationId: comments.interpretationId,
          })
          .from(comments)
          .where(eq(comments.id, input.parentCommentId))
          .limit(1);
        if (!parent || parent.interpretationId !== input.interpretationId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Родительский комментарий не от этой интерпретации",
          });
        }
      }

      const [inserted] = await ctx.db
        .insert(comments)
        .values({
          interpretationId: input.interpretationId,
          parentCommentId: input.parentCommentId ?? null,
          authorId: ctx.userId,
          body: input.body,
          stance: input.stance,
        })
        .returning({ id: comments.id });

      // --- Notify: reply to interpretation author + @mentions ---
      const entity = await ctx.db.query.entities.findFirst({
        where: (e, { eq: e2 }) => e2(e.id, interp.entityId),
        columns: { slug: true, language: true },
      });
      const url = entity
        ? `/${entity.language}/entities/${entity.slug}`
        : null;

      const recipients = new Set<string>();
      // reply notification
      if (interp.authorId && interp.authorId !== ctx.userId) {
        recipients.add(interp.authorId);
        await ctx.db.insert(notifications).values({
          recipientId: interp.authorId,
          actorId: ctx.userId,
          type: "reply",
          targetType: "comment",
          targetId: inserted!.id,
          url,
          message: "ответил на твою интерпретацию",
        });
      }

      // @mentions
      const mentioned = extractMentions(input.body);
      if (mentioned.length > 0) {
        const mentionedUsers = await ctx.db
          .select({ id: users.id, username: users.username })
          .from(users)
          .where(inArray(users.username, mentioned));
        for (const m of mentionedUsers) {
          if (m.id !== ctx.userId && !recipients.has(m.id)) {
            recipients.add(m.id);
            await ctx.db.insert(notifications).values({
              recipientId: m.id,
              actorId: ctx.userId,
              type: "mention",
              targetType: "comment",
              targetId: inserted!.id,
              url,
              message: "упомянул тебя в комментарии",
            });
          }
        }
      }

      return { id: inserted!.id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        body: z.string().min(2).max(2000),
        stance: stanceSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: comments.id, authorId: comments.authorId })
        .from(comments)
        .where(eq(comments.id, input.id))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.authorId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Только автор может редактировать",
        });
      }
      await ctx.db
        .update(comments)
        .set({
          body: input.body,
          stance: input.stance,
          updatedAt: new Date(),
        })
        .where(eq(comments.id, input.id));
      return { ok: true as const };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: comments.id, authorId: comments.authorId })
        .from(comments)
        .where(eq(comments.id, input.id))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.authorId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Только автор может удалить",
        });
      }
      await ctx.db.delete(comments).where(eq(comments.id, input.id));
      return { ok: true as const };
    }),
});
