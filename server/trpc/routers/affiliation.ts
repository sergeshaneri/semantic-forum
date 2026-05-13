import { TRPCError } from "@trpc/server";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import {
  userInfluences,
  userSchools,
  users,
} from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";

export const affiliationRouter = createTRPCRouter({
  setSchools: protectedProcedure
    .input(z.object({ schoolIds: z.array(z.string().uuid()).max(10) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(userSchools)
        .where(eq(userSchools.userId, ctx.userId));
      if (input.schoolIds.length > 0) {
        await ctx.db
          .insert(userSchools)
          .values(
            input.schoolIds.map((schoolId) => ({
              userId: ctx.userId,
              schoolId,
            })),
          );
      }
      return { ok: true as const };
    }),

  setMentorFlags: protectedProcedure
    .input(
      z.object({
        mentorAvailable: z.boolean(),
        mentorSeeking: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({
          mentorAvailable: input.mentorAvailable,
          mentorSeeking: input.mentorSeeking,
        })
        .where(eq(users.id, ctx.userId));
      return { ok: true as const };
    }),

  listUserInfluences: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.query.userInfluences.findMany({
        where: eq(userInfluences.userId, input.userId),
        orderBy: [asc(userInfluences.position)],
        with: {
          influencerUser: {
            columns: { id: true, username: true, name: true },
          },
        },
      });
      return rows.map((r) => ({
        id: r.id,
        externalName: r.externalName,
        note: r.note,
        influencerUser: r.influencerUser
          ? {
              id: r.influencerUser.id,
              username: r.influencerUser.username ?? "",
              name: r.influencerUser.name ?? "",
            }
          : null,
      }));
    }),

  addInfluence: protectedProcedure
    .input(
      z
        .object({
          influencerUsername: z.string().optional(),
          externalName: z.string().max(200).optional(),
          note: z.string().max(300).optional(),
        })
        .refine(
          (v) =>
            Boolean(v.influencerUsername) || Boolean(v.externalName),
          { message: "Нужен либо username, либо имя внешнего автора" },
        ),
    )
    .mutation(async ({ ctx, input }) => {
      let influencerUserId: string | null = null;
      if (input.influencerUsername) {
        const target = await ctx.db.query.users.findFirst({
          where: eq(users.username, input.influencerUsername),
          columns: { id: true },
        });
        if (!target) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Пользователь с таким username не найден",
          });
        }
        if (target.id === ctx.userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Нельзя указать себя как влияние",
          });
        }
        influencerUserId = target.id;
      }
      const [inserted] = await ctx.db
        .insert(userInfluences)
        .values({
          userId: ctx.userId,
          influencerUserId,
          externalName: input.externalName ?? null,
          note: input.note ?? null,
        })
        .returning({ id: userInfluences.id });
      return { id: inserted!.id };
    }),

  removeInfluence: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(userInfluences)
        .where(
          and(
            eq(userInfluences.id, input.id),
            eq(userInfluences.userId, ctx.userId),
          ),
        );
      return { ok: true as const };
    }),
});
