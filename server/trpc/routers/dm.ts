import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import {
  conversationParticipants,
  conversations,
  messages,
  notifications,
  users,
} from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../init";

async function findOrCreateConversation(
  db: typeof import("@/server/db").db,
  userIdA: string,
  userIdB: string,
): Promise<string> {
  // Find a conversation where both users are participants and it's a 1-on-1.
  const existing = await db.execute<{ conversation_id: string }>(sql`
    SELECT cp1.conversation_id AS conversation_id
    FROM conversation_participants cp1
    INNER JOIN conversation_participants cp2
      ON cp1.conversation_id = cp2.conversation_id
    WHERE cp1.user_id = ${userIdA}
      AND cp2.user_id = ${userIdB}
      AND (
        SELECT COUNT(*) FROM conversation_participants cp
        WHERE cp.conversation_id = cp1.conversation_id
      ) = 2
    LIMIT 1
  `);
  if (existing.length > 0) return existing[0]!.conversation_id;

  const [created] = await db
    .insert(conversations)
    .values({})
    .returning({ id: conversations.id });
  const convId = created!.id;
  await db.insert(conversationParticipants).values([
    { conversationId: convId, userId: userIdA },
    { conversationId: convId, userId: userIdB },
  ]);
  return convId;
}

export const dmRouter = createTRPCRouter({
  threads: protectedProcedure.query(async ({ ctx }) => {
    const myConvs = await ctx.db
      .select({
        conversationId: conversationParticipants.conversationId,
        lastReadAt: conversationParticipants.lastReadAt,
      })
      .from(conversationParticipants)
      .where(eq(conversationParticipants.userId, ctx.userId));
    if (myConvs.length === 0) return [];

    const convIds = myConvs.map((c) => c.conversationId);
    const lastReadByConv = new Map(
      myConvs.map((c) => [c.conversationId, c.lastReadAt]),
    );

    const convs = await ctx.db
      .select({
        id: conversations.id,
        lastMessageAt: conversations.lastMessageAt,
        createdAt: conversations.createdAt,
      })
      .from(conversations)
      .where(inArray(conversations.id, convIds));

    // Other participants per conversation
    const otherParts = await ctx.db
      .select({
        conversationId: conversationParticipants.conversationId,
        userId: conversationParticipants.userId,
      })
      .from(conversationParticipants)
      .where(
        and(
          inArray(conversationParticipants.conversationId, convIds),
          sql`${conversationParticipants.userId} <> ${ctx.userId}`,
        ),
      );
    const otherUserIds = Array.from(new Set(otherParts.map((p) => p.userId)));
    const userRows =
      otherUserIds.length > 0
        ? await ctx.db
            .select({
              id: users.id,
              username: users.username,
              name: users.name,
              image: users.image,
            })
            .from(users)
            .where(inArray(users.id, otherUserIds))
        : [];
    const userById = new Map(userRows.map((u) => [u.id, u]));
    const othersByConv = new Map<string, typeof userRows>();
    for (const p of otherParts) {
      const u = userById.get(p.userId);
      if (!u) continue;
      const arr = othersByConv.get(p.conversationId) ?? [];
      arr.push(u);
      othersByConv.set(p.conversationId, arr);
    }

    // Last message + unread count per conversation
    const lastMsgs = await ctx.db.execute<{
      conversation_id: string;
      body: string;
      created_at: Date;
      author_id: string;
    }>(sql`
      SELECT DISTINCT ON (conversation_id)
        conversation_id, body, created_at, author_id
      FROM messages
      WHERE conversation_id = ANY(${convIds})
      ORDER BY conversation_id, created_at DESC
    `);
    const lastMsgByConv = new Map(
      lastMsgs.map((m) => [m.conversation_id, m]),
    );

    const unreadCounts = await ctx.db.execute<{
      conversation_id: string;
      n: number;
    }>(sql`
      SELECT m.conversation_id AS conversation_id, COUNT(*)::int AS n
      FROM messages m
      INNER JOIN conversation_participants cp
        ON cp.conversation_id = m.conversation_id
        AND cp.user_id = ${ctx.userId}
      WHERE m.conversation_id = ANY(${convIds})
        AND m.author_id <> ${ctx.userId}
        AND (cp.last_read_at IS NULL OR m.created_at > cp.last_read_at)
      GROUP BY m.conversation_id
    `);
    const unreadByConv = new Map(
      unreadCounts.map((u) => [u.conversation_id, Number(u.n)]),
    );

    const rows = convs.map((c) => ({
      id: c.id,
      lastMessageAt: c.lastMessageAt,
      createdAt: c.createdAt,
      lastReadAt: lastReadByConv.get(c.id) ?? null,
      others: (othersByConv.get(c.id) ?? []).map((u) => ({
        id: u.id,
        username: u.username ?? "",
        name: u.name ?? "",
        image: u.image ?? null,
      })),
      lastMessage: lastMsgByConv.get(c.id)
        ? {
            body: lastMsgByConv.get(c.id)!.body,
            createdAt: lastMsgByConv.get(c.id)!.created_at,
            fromMe: lastMsgByConv.get(c.id)!.author_id === ctx.userId,
          }
        : null,
      unread: unreadByConv.get(c.id) ?? 0,
    }));

    rows.sort((a, b) => {
      const aT = a.lastMessageAt ?? a.createdAt;
      const bT = b.lastMessageAt ?? b.createdAt;
      return new Date(bT).getTime() - new Date(aT).getTime();
    });
    return rows;
  }),

  thread: protectedProcedure
    .input(z.object({ conversationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [part] = await ctx.db
        .select({ x: conversationParticipants.userId })
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, input.conversationId),
            eq(conversationParticipants.userId, ctx.userId),
          ),
        )
        .limit(1);
      if (!part) throw new TRPCError({ code: "FORBIDDEN" });

      const otherParts = await ctx.db
        .select({ userId: conversationParticipants.userId })
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, input.conversationId),
            sql`${conversationParticipants.userId} <> ${ctx.userId}`,
          ),
        );
      const otherIds = otherParts.map((p) => p.userId);
      const others =
        otherIds.length > 0
          ? await ctx.db
              .select({
                id: users.id,
                username: users.username,
                name: users.name,
                image: users.image,
              })
              .from(users)
              .where(inArray(users.id, otherIds))
          : [];

      const msgs = await ctx.db.query.messages.findMany({
        where: eq(messages.conversationId, input.conversationId),
        orderBy: [desc(messages.createdAt)],
        limit: 200,
      });

      return {
        conversationId: input.conversationId,
        participants: others.map((u) => ({
          id: u.id,
          username: u.username ?? "",
          name: u.name ?? "",
          image: u.image ?? null,
        })),
        messages: msgs
          .map((m) => ({
            id: m.id,
            body: m.body,
            createdAt: m.createdAt,
            authorId: m.authorId,
            fromMe: m.authorId === ctx.userId,
          }))
          .reverse(),
      };
    }),

  start: protectedProcedure
    .input(z.object({ username: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const u = input.username.trim().replace(/^@/, "");
      const [target] = await ctx.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, u))
        .limit(1);
      if (!target) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Пользователь не найден",
        });
      }
      if (target.id === ctx.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Себе писать не нужно",
        });
      }
      const id = await findOrCreateConversation(ctx.db, ctx.userId, target.id);
      return { conversationId: id };
    }),

  send: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        body: z.string().min(1).max(4000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [part] = await ctx.db
        .select({ x: conversationParticipants.userId })
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, input.conversationId),
            eq(conversationParticipants.userId, ctx.userId),
          ),
        )
        .limit(1);
      if (!part) throw new TRPCError({ code: "FORBIDDEN" });

      const [inserted] = await ctx.db
        .insert(messages)
        .values({
          conversationId: input.conversationId,
          authorId: ctx.userId,
          body: input.body,
        })
        .returning({ id: messages.id });

      await ctx.db
        .update(conversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(conversations.id, input.conversationId));

      // Notify other participants
      const otherParts = await ctx.db
        .select({ userId: conversationParticipants.userId })
        .from(conversationParticipants)
        .where(
          and(
            eq(conversationParticipants.conversationId, input.conversationId),
            sql`${conversationParticipants.userId} <> ${ctx.userId}`,
          ),
        );
      if (otherParts.length > 0) {
        await ctx.db.insert(notifications).values(
          otherParts.map((p) => ({
            recipientId: p.userId,
            actorId: ctx.userId,
            type: "message" as const,
            targetType: "message",
            targetId: inserted!.id,
            url: `/messages/${input.conversationId}`,
            message: "написал тебе",
          })),
        );
      }

      return { id: inserted!.id };
    }),

  markRead: protectedProcedure
    .input(z.object({ conversationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(conversationParticipants)
        .set({ lastReadAt: new Date() })
        .where(
          and(
            eq(conversationParticipants.conversationId, input.conversationId),
            eq(conversationParticipants.userId, ctx.userId),
          ),
        );
      return { ok: true as const };
    }),

  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.execute<{ n: number }>(sql`
      SELECT COUNT(*)::int AS n
      FROM messages m
      INNER JOIN conversation_participants cp
        ON cp.conversation_id = m.conversation_id
        AND cp.user_id = ${ctx.userId}
      WHERE m.author_id <> ${ctx.userId}
        AND (cp.last_read_at IS NULL OR m.created_at > cp.last_read_at)
    `);
    return Number(rows[0]?.n ?? 0);
  }),
});
