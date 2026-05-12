import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { notifications } from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../init";

export const notificationRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z
        .object({
          unreadOnly: z.boolean().default(false),
          limit: z.number().default(30),
        })
        .default({ unreadOnly: false, limit: 30 }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.query.notifications.findMany({
        where: input.unreadOnly
          ? and(
              eq(notifications.recipientId, ctx.userId),
              isNull(notifications.readAt),
            )
          : eq(notifications.recipientId, ctx.userId),
        orderBy: [desc(notifications.createdAt)],
        limit: input.limit,
        with: {
          actor: { columns: { id: true, username: true, name: true } },
        },
      });
      return rows.map((n) => ({
        id: n.id,
        type: n.type,
        url: n.url,
        message: n.message,
        readAt: n.readAt,
        createdAt: n.createdAt,
        actor: n.actor
          ? {
              id: n.actor.id,
              username: n.actor.username ?? "",
              name: n.actor.name ?? "",
            }
          : null,
      }));
    }),

  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const [{ c }] = await ctx.db
      .select({ c: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientId, ctx.userId),
          isNull(notifications.readAt),
        ),
      );
    return Number(c);
  }),

  markRead: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(notifications)
        .set({ readAt: new Date() })
        .where(
          and(
            eq(notifications.id, input.id),
            eq(notifications.recipientId, ctx.userId),
          ),
        );
      return { ok: true as const };
    }),

  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notifications.recipientId, ctx.userId),
          isNull(notifications.readAt),
        ),
      );
    return { ok: true as const };
  }),
});
