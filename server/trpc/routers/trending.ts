import { desc, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { interpretations } from "@/server/db/schema";
import { createTRPCRouter, publicProcedure } from "../init";

export const trendingRouter = createTRPCRouter({
  interpretations: publicProcedure
    .input(
      z.object({
        language: z.enum(["ru", "en"]),
        days: z.number().int().min(1).max(60).default(7),
        limit: z.number().int().min(1).max(30).default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      const since = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);
      const rows = await ctx.db.query.interpretations.findMany({
        where: (i, { and, eq, gte: gte2 }) =>
          and(eq(i.language, input.language), gte2(i.createdAt, since)),
        orderBy: [desc(interpretations.score)],
        limit: input.limit,
        with: {
          entity: { columns: { slug: true, title: true } },
          theory: { columns: { slug: true, name: true } },
          theoryObject: {
            columns: { slug: true, name: true, metadata: true },
          },
          author: { columns: { username: true, name: true } },
        },
      });
      void gte;
      void sql;
      return rows.map((i) => ({
        id: i.id,
        score: i.score,
        body: i.body,
        createdAt: i.createdAt,
        entity: i.entity,
        theory: i.theory,
        theoryObject: i.theoryObject
          ? {
              slug: i.theoryObject.slug,
              name: i.theoryObject.name,
              metadata: i.theoryObject.metadata as
                | Record<string, unknown>
                | null,
            }
          : null,
        author: i.author
          ? {
              username: i.author.username ?? "",
              name: i.author.name ?? "",
            }
          : null,
      }));
    }),
});
