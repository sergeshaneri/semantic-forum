import { sql } from "drizzle-orm";
import { createTRPCRouter, publicProcedure } from "../init";

export const healthRouter = createTRPCRouter({
  ping: publicProcedure.query(() => ({
    ok: true,
    at: new Date().toISOString(),
  })),
  db: publicProcedure.query(async ({ ctx }) => {
    try {
      await ctx.db.execute(sql`SELECT 1`);
      return { connected: true as const };
    } catch (error) {
      return {
        connected: false as const,
        error: error instanceof Error ? error.message : "unknown",
      };
    }
  }),
});
