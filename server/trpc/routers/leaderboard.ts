import { sql } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";

export const leaderboardRouter = createTRPCRouter({
  top: publicProcedure
    .input(
      z.object({
        days: z.number().int().min(1).max(365).optional(),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const since = input.days
        ? new Date(Date.now() - input.days * 24 * 60 * 60 * 1000)
        : null;
      const cutoff = since ? since.toISOString() : null;

      const rows = await ctx.db.execute<{
        user_id: string;
        username: string;
        name: string;
        image: string | null;
        karma: number;
        interp_count: number;
        comment_count: number;
      }>(sql`
        SELECT
          u.id AS user_id,
          u.username AS username,
          u.name AS name,
          u.image AS image,
          COALESCE((
            SELECT SUM(v.value)::int
            FROM votes v
            WHERE (
              (v.target_type = 'interpretation' AND v.target_id IN (
                SELECT id FROM interpretations
                WHERE author_id = u.id
                ${cutoff ? sql`AND created_at >= ${cutoff}` : sql``}
              ))
              OR (v.target_type = 'comment' AND v.target_id IN (
                SELECT id FROM comments
                WHERE author_id = u.id
                ${cutoff ? sql`AND created_at >= ${cutoff}` : sql``}
              ))
            )
            ${cutoff ? sql`AND v.created_at >= ${cutoff}` : sql``}
          ), 0) AS karma,
          (
            SELECT COUNT(*)::int FROM interpretations
            WHERE author_id = u.id
            ${cutoff ? sql`AND created_at >= ${cutoff}` : sql``}
          ) AS interp_count,
          (
            SELECT COUNT(*)::int FROM comments
            WHERE author_id = u.id
            ${cutoff ? sql`AND created_at >= ${cutoff}` : sql``}
          ) AS comment_count
        FROM users u
        WHERE u.username IS NOT NULL
        ORDER BY karma DESC, interp_count DESC
        LIMIT ${input.limit}
      `);

      return rows
        .map((r) => ({
          userId: r.user_id,
          username: r.username,
          name: r.name,
          image: r.image,
          karma: Number(r.karma),
          interpretationCount: Number(r.interp_count),
          commentCount: Number(r.comment_count),
        }))
        .filter(
          (r) =>
            r.karma !== 0 || r.interpretationCount > 0 || r.commentCount > 0,
        );
    }),
});
