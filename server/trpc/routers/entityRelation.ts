import { TRPCError } from "@trpc/server";
import { and, eq, ne, or } from "drizzle-orm";
import { z } from "zod";
import { entities, entityRelations } from "@/server/db/schema";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../init";

export const relationKinds = [
  "related",
  "synonym",
  "antonym",
  "part_of",
  "contains",
  "example_of",
  "instance_of",
  "causes",
  "precedes",
  "custom",
] as const;

const kindSchema = z.enum(relationKinds);

export const entityRelationRouter = createTRPCRouter({
  listForEntity: publicProcedure
    .input(z.object({ entityId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.query.entityRelations.findMany({
        where: or(
          eq(entityRelations.sourceEntityId, input.entityId),
          eq(entityRelations.targetEntityId, input.entityId),
        ),
        with: {
          source: { columns: { id: true, slug: true, title: true, kind: true } },
          target: { columns: { id: true, slug: true, title: true, kind: true } },
          creator: { columns: { id: true, username: true } },
        },
        orderBy: (r, { desc }) => [desc(r.createdAt)],
      });

      return rows.map((r) => {
        const isOutgoing = r.sourceEntityId === input.entityId;
        const other = isOutgoing ? r.target : r.source;
        return {
          id: r.id,
          kind: r.kind,
          customLabel: r.customLabel,
          description: r.description,
          isOutgoing,
          other: other
            ? {
                id: other.id,
                slug: other.slug,
                title: other.title,
                kind: other.kind,
              }
            : null,
          creator: r.creator
            ? { id: r.creator.id, username: r.creator.username ?? "" }
            : null,
          createdAt: r.createdAt,
        };
      });
    }),

  create: protectedProcedure
    .input(
      z
        .object({
          sourceEntityId: z.string().uuid(),
          targetEntityId: z.string().uuid(),
          kind: kindSchema,
          customLabel: z.string().min(1).max(100).optional(),
          description: z.string().max(500).optional(),
        })
        .refine(
          (v) =>
            v.kind !== "custom" ||
            (v.customLabel && v.customLabel.trim().length > 0),
          {
            message: "При custom связи нужно указать подпись",
            path: ["customLabel"],
          },
        )
        .refine((v) => v.sourceEntityId !== v.targetEntityId, {
          message: "Нельзя связать сущность с собой",
          path: ["targetEntityId"],
        }),
    )
    .mutation(async ({ ctx, input }) => {
      const found = await ctx.db
        .select({ id: entities.id })
        .from(entities)
        .where(
          or(
            eq(entities.id, input.sourceEntityId),
            eq(entities.id, input.targetEntityId),
          ),
        );
      if (found.length < 2) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Одна из сущностей не найдена",
        });
      }

      const existing = await ctx.db
        .select({ id: entityRelations.id })
        .from(entityRelations)
        .where(
          and(
            eq(entityRelations.sourceEntityId, input.sourceEntityId),
            eq(entityRelations.targetEntityId, input.targetEntityId),
            eq(entityRelations.kind, input.kind),
          ),
        )
        .limit(1);
      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Такая связь уже существует",
        });
      }

      const [inserted] = await ctx.db
        .insert(entityRelations)
        .values({
          sourceEntityId: input.sourceEntityId,
          targetEntityId: input.targetEntityId,
          kind: input.kind,
          customLabel: input.kind === "custom" ? input.customLabel : null,
          description: input.description ?? null,
          createdBy: ctx.userId,
        })
        .returning({ id: entityRelations.id });

      return { id: inserted!.id };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ createdBy: entityRelations.createdBy })
        .from(entityRelations)
        .where(eq(entityRelations.id, input.id))
        .limit(1);
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (existing.createdBy && existing.createdBy !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Удалять связь может только её автор",
        });
      }
      await ctx.db.delete(entityRelations).where(eq(entityRelations.id, input.id));
      return { ok: true as const };
    }),

  searchEntities: publicProcedure
    .input(
      z.object({
        language: z.enum(["ru", "en"]),
        excludeId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select({
          id: entities.id,
          slug: entities.slug,
          title: entities.title,
          kind: entities.kind,
        })
        .from(entities)
        .where(
          and(
            eq(entities.language, input.language),
            ne(entities.id, input.excludeId),
          ),
        )
        .limit(200);
      return rows;
    }),
});
