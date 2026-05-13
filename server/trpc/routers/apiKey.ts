import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { apiKeys } from "@/server/db/schema";
import { generateApiKey, KNOWN_SCOPES } from "@/lib/api-key";
import { createTRPCRouter, sessionOnlyProcedure } from "../init";

const scopeSchema = z.enum(KNOWN_SCOPES);

export const apiKeyRouter = createTRPCRouter({
  mine: sessionOnlyProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        id: apiKeys.id,
        prefix: apiKeys.prefix,
        label: apiKeys.label,
        scopes: apiKeys.scopes,
        lastUsedAt: apiKeys.lastUsedAt,
        expiresAt: apiKeys.expiresAt,
        revokedAt: apiKeys.revokedAt,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.userId, ctx.userId))
      .orderBy(desc(apiKeys.createdAt));
    return rows.map((r) => ({
      id: r.id,
      prefix: r.prefix,
      label: r.label,
      scopes: (r.scopes ?? []) as string[],
      lastUsedAt: r.lastUsedAt,
      expiresAt: r.expiresAt,
      revokedAt: r.revokedAt,
      createdAt: r.createdAt,
    }));
  }),

  create: sessionOnlyProcedure
    .input(
      z.object({
        label: z.string().max(200).optional(),
        scopes: z.array(scopeSchema).min(1).max(8),
        expiresInDays: z.number().int().min(1).max(3650).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Cap total active keys per user
      const active = await ctx.db
        .select({ id: apiKeys.id })
        .from(apiKeys)
        .where(
          and(eq(apiKeys.userId, ctx.userId), isNull(apiKeys.revokedAt)),
        );
      if (active.length >= 20) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Достигнут лимит активных ключей (20).",
        });
      }

      const { raw, hash, prefix } = generateApiKey();
      const expiresAt = input.expiresInDays
        ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)
        : null;

      const [inserted] = await ctx.db
        .insert(apiKeys)
        .values({
          userId: ctx.userId,
          keyHash: hash,
          prefix,
          label: input.label?.trim() || null,
          scopes: input.scopes,
          expiresAt,
        })
        .returning({ id: apiKeys.id, prefix: apiKeys.prefix });

      // raw is returned ONCE — caller must store it.
      return {
        id: inserted!.id,
        prefix: inserted!.prefix,
        raw,
      };
    }),

  revoke: sessionOnlyProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select({ id: apiKeys.id, userId: apiKeys.userId })
        .from(apiKeys)
        .where(eq(apiKeys.id, input.id))
        .limit(1);
      if (!row) throw new TRPCError({ code: "NOT_FOUND" });
      if (row.userId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.db
        .update(apiKeys)
        .set({ revokedAt: new Date() })
        .where(eq(apiKeys.id, input.id));
      return { ok: true as const };
    }),

  delete: sessionOnlyProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select({ id: apiKeys.id, userId: apiKeys.userId })
        .from(apiKeys)
        .where(eq(apiKeys.id, input.id))
        .limit(1);
      if (!row) throw new TRPCError({ code: "NOT_FOUND" });
      if (row.userId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.db.delete(apiKeys).where(eq(apiKeys.id, input.id));
      return { ok: true as const };
    }),
});
