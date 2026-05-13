import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import {
  answers,
  comments,
  groupPosts,
  interpretations,
  votes,
} from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../init";

const TARGET_TYPES = [
  "interpretation",
  "comment",
  "answer",
  "group_post",
] as const;
type TargetType = (typeof TARGET_TYPES)[number];

const castSchema = z.object({
  targetType: z.enum(TARGET_TYPES),
  targetId: z.string().uuid(),
  value: z.union([z.literal(1), z.literal(-1)]),
});

async function recountTarget(
  db: typeof import("@/server/db").db,
  targetType: TargetType,
  targetId: string,
) {
  const [agg] = await db
    .select({
      up: sql<number>`coalesce(sum(case when ${votes.value} = 1 then 1 else 0 end)::int, 0)`,
      down: sql<number>`coalesce(sum(case when ${votes.value} = -1 then 1 else 0 end)::int, 0)`,
    })
    .from(votes)
    .where(
      and(eq(votes.targetType, targetType), eq(votes.targetId, targetId)),
    );

  const up = Number(agg?.up ?? 0);
  const down = Number(agg?.down ?? 0);

  if (targetType === "interpretation") {
    await db
      .update(interpretations)
      .set({ votesUp: up, votesDown: down, score: up - down })
      .where(eq(interpretations.id, targetId));
  } else if (targetType === "comment") {
    await db
      .update(comments)
      .set({ votesUp: up, votesDown: down })
      .where(eq(comments.id, targetId));
  } else if (targetType === "answer") {
    await db
      .update(answers)
      .set({ votesUp: up, votesDown: down, score: up - down })
      .where(eq(answers.id, targetId));
  } else {
    await db
      .update(groupPosts)
      .set({ votesUp: up, votesDown: down, score: up - down })
      .where(eq(groupPosts.id, targetId));
  }

  return { votesUp: up, votesDown: down, score: up - down };
}

export const voteRouter = createTRPCRouter({
  cast: protectedProcedure
    .input(castSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const existing = await ctx.db
        .select()
        .from(votes)
        .where(
          and(
            eq(votes.userId, userId),
            eq(votes.targetType, input.targetType),
            eq(votes.targetId, input.targetId),
          ),
        )
        .limit(1);

      const current = existing[0];
      let newUserVote: 1 | -1 | 0;

      if (current?.value === input.value) {
        await ctx.db.delete(votes).where(eq(votes.id, current.id));
        newUserVote = 0;
      } else if (current) {
        await ctx.db
          .update(votes)
          .set({ value: input.value })
          .where(eq(votes.id, current.id));
        newUserVote = input.value;
      } else {
        await ctx.db.insert(votes).values({
          userId,
          targetType: input.targetType,
          targetId: input.targetId,
          value: input.value,
        });
        newUserVote = input.value;
      }

      const counts = await recountTarget(
        ctx.db,
        input.targetType,
        input.targetId,
      );

      return {
        ...counts,
        userVote: newUserVote,
      };
    }),
});
