import { sql } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";

const langSchema = z.enum(["ru", "en"]);

export const statsRouter = createTRPCRouter({
  global: publicProcedure
    .input(z.object({ language: langSchema }).optional())
    .query(async ({ ctx, input }) => {
      const lang = input?.language ?? null;
      const langCond = lang ? sql`WHERE language = ${lang}` : sql``;

      const [counts] = await ctx.db.execute<{
        users: number;
        entities: number;
        theories: number;
        interpretations: number;
        comments: number;
        votes: number;
        publications: number;
        schools: number;
        questions: number;
        events: number;
      }>(sql`
        SELECT
          (SELECT COUNT(*)::int FROM users WHERE username IS NOT NULL) AS users,
          (SELECT COUNT(*)::int FROM entities ${langCond}) AS entities,
          (SELECT COUNT(*)::int FROM theories ${langCond}) AS theories,
          (SELECT COUNT(*)::int FROM interpretations ${langCond}) AS interpretations,
          (SELECT COUNT(*)::int FROM comments) AS comments,
          (SELECT COUNT(*)::int FROM votes) AS votes,
          (SELECT COUNT(*)::int FROM publications ${langCond}) AS publications,
          (SELECT COUNT(*)::int FROM schools ${langCond}) AS schools,
          (SELECT COUNT(*)::int FROM questions ${langCond}) AS questions,
          (SELECT COUNT(*)::int FROM events ${langCond}) AS events
      `);

      const weeklyRows = await ctx.db.execute<{
        new_interpretations: number;
        new_comments: number;
        new_users: number;
      }>(sql`
        SELECT
          (SELECT COUNT(*)::int FROM interpretations
             WHERE created_at >= NOW() - INTERVAL '7 days') AS new_interpretations,
          (SELECT COUNT(*)::int FROM comments
             WHERE created_at >= NOW() - INTERVAL '7 days') AS new_comments,
          (SELECT COUNT(*)::int FROM users
             WHERE created_at >= NOW() - INTERVAL '7 days'
               AND username IS NOT NULL) AS new_users
      `);
      const weekly = weeklyRows[0] ?? {
        new_interpretations: 0,
        new_comments: 0,
        new_users: 0,
      };

      return {
        totals: {
          users: Number(counts?.users ?? 0),
          entities: Number(counts?.entities ?? 0),
          theories: Number(counts?.theories ?? 0),
          interpretations: Number(counts?.interpretations ?? 0),
          comments: Number(counts?.comments ?? 0),
          votes: Number(counts?.votes ?? 0),
          publications: Number(counts?.publications ?? 0),
          schools: Number(counts?.schools ?? 0),
          questions: Number(counts?.questions ?? 0),
          events: Number(counts?.events ?? 0),
        },
        weekly: {
          newInterpretations: Number(weekly.new_interpretations),
          newComments: Number(weekly.new_comments),
          newUsers: Number(weekly.new_users),
        },
      };
    }),
});
