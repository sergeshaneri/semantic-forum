import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { userLinks } from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../init";

const kindSchema = z.enum([
  "website",
  "telegram",
  "youtube",
  "instagram",
  "twitter",
  "vk",
  "linkedin",
  "github",
  "other",
]);

export const userLinkRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        kind: kindSchema,
        label: z.string().min(1).max(100),
        url: z.string().url().max(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [inserted] = await ctx.db
        .insert(userLinks)
        .values({
          userId: ctx.userId,
          kind: input.kind,
          label: input.label,
          url: input.url,
        })
        .returning({ id: userLinks.id });
      return { id: inserted!.id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        kind: kindSchema,
        label: z.string().min(1).max(100),
        url: z.string().url().max(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: userLinks.id, userId: userLinks.userId })
        .from(userLinks)
        .where(eq(userLinks.id, input.id))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.userId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.db
        .update(userLinks)
        .set({ kind: input.kind, label: input.label, url: input.url })
        .where(eq(userLinks.id, input.id));
      return { ok: true as const };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: userLinks.id, userId: userLinks.userId })
        .from(userLinks)
        .where(eq(userLinks.id, input.id))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.userId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.db.delete(userLinks).where(eq(userLinks.id, input.id));
      return { ok: true as const };
    }),
});
