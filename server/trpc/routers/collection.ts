import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { collectionItems, collections, users } from "@/server/db/schema";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../init";

const TARGET_VALUES = [
  "entity",
  "interpretation",
  "theory",
  "theory_object",
  "publication",
  "product",
  "school",
  "source",
] as const;
type TargetValue = (typeof TARGET_VALUES)[number];
const targetSchema = z.enum(TARGET_VALUES);
const slugSchema = z
  .string()
  .min(2)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const collectionRouter = createTRPCRouter({
  mine: protectedProcedure
    .input(
      z
        .object({
          containing: z
            .object({
              targetType: targetSchema,
              targetId: z.string(),
            })
            .optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const target = input?.containing;
      const rows = await ctx.db.query.collections.findMany({
        where: eq(collections.userId, ctx.userId),
        orderBy: [desc(collections.createdAt)],
        with: {
          items: target
            ? {
                columns: {
                  collectionId: true,
                  targetType: true,
                  targetId: true,
                },
              }
            : { columns: { collectionId: true } },
        },
      });
      return rows.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        isPublic: c.isPublic,
        itemCount: c.items.length,
        contains: target
          ? c.items.some(
              (it) =>
                "targetType" in it &&
                it.targetType === target.targetType &&
                it.targetId === target.targetId,
            )
          : false,
        createdAt: c.createdAt,
      }));
    }),

  listByUser: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.username, input.username),
        columns: { id: true },
      });
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      const rows = await ctx.db.query.collections.findMany({
        where: and(
          eq(collections.userId, user.id),
          eq(collections.isPublic, true),
        ),
        orderBy: [desc(collections.createdAt)],
        with: { items: { columns: { collectionId: true } } },
      });
      return rows.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description,
        itemCount: c.items.length,
      }));
    }),

  getBySlug: publicProcedure
    .input(z.object({ username: z.string(), slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.username, input.username),
        columns: { id: true, username: true, name: true },
      });
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      const collection = await ctx.db.query.collections.findFirst({
        where: and(
          eq(collections.userId, user.id),
          eq(collections.slug, input.slug),
        ),
        with: { items: true },
      });
      if (!collection) throw new TRPCError({ code: "NOT_FOUND" });

      const viewerId = ctx.session?.user?.id ?? null;
      if (!collection.isPublic && viewerId !== user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Resolve items to displayable rows
      const items: Array<{
        targetType: TargetValue;
        targetId: string;
        title: string;
        subtitle: string | null;
        href: string;
        note: string | null;
      }> = [];
      for (const it of collection.items) {
        try {
          if (it.targetType === "entity") {
            const e = await ctx.db.query.entities.findFirst({
              where: (en, { eq: e2 }) => e2(en.id, it.targetId),
              columns: { slug: true, title: true, kind: true, language: true },
            });
            if (e)
              items.push({
                targetType: it.targetType,
                targetId: it.targetId,
                title: e.title,
                subtitle: e.kind,
                href: `/${e.language}/entities/${e.slug}`,
                note: it.note,
              });
          } else if (it.targetType === "publication") {
            const p = await ctx.db.query.publications.findFirst({
              where: (pb, { eq: e2 }) => e2(pb.id, it.targetId),
              columns: { slug: true, title: true, kind: true, language: true },
              with: { author: { columns: { username: true } } },
            });
            if (p?.author?.username)
              items.push({
                targetType: it.targetType,
                targetId: it.targetId,
                title: p.title,
                subtitle: p.kind,
                href: `/${p.language}/u/${p.author.username}/p/${p.slug}`,
                note: it.note,
              });
          } else if (it.targetType === "theory") {
            const t = await ctx.db.query.theories.findFirst({
              where: (th, { eq: e2 }) => e2(th.id, it.targetId),
              columns: { slug: true, name: true, language: true },
            });
            if (t)
              items.push({
                targetType: it.targetType,
                targetId: it.targetId,
                title: t.name,
                subtitle: null,
                href: `/${t.language}/theories/${t.slug}`,
                note: it.note,
              });
          } else if (it.targetType === "school") {
            const s = await ctx.db.query.schools.findFirst({
              where: (sc, { eq: e2 }) => e2(sc.id, it.targetId),
              columns: { slug: true, name: true, language: true },
            });
            if (s)
              items.push({
                targetType: it.targetType,
                targetId: it.targetId,
                title: s.name,
                subtitle: null,
                href: `/${s.language}/schools/${s.slug}`,
                note: it.note,
              });
          } else if (it.targetType === "interpretation") {
            const i = await ctx.db.query.interpretations.findFirst({
              where: (ip, { eq: e2 }) => e2(ip.id, it.targetId),
              columns: { body: true, language: true },
              with: { entity: { columns: { slug: true, title: true } } },
            });
            if (i?.entity)
              items.push({
                targetType: it.targetType,
                targetId: it.targetId,
                title: i.body.slice(0, 80) + (i.body.length > 80 ? "…" : ""),
                subtitle: i.entity.title,
                href: `/${i.language}/entities/${i.entity.slug}`,
                note: it.note,
              });
          }
        } catch {
          // skip
        }
      }

      return {
        owner: {
          id: user.id,
          username: user.username ?? "",
          name: user.name ?? "",
        },
        collection: {
          id: collection.id,
          slug: collection.slug,
          name: collection.name,
          description: collection.description,
          isPublic: collection.isPublic,
          createdAt: collection.createdAt,
          isOwner: viewerId === user.id,
        },
        items,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(200),
        slug: slugSchema,
        description: z.string().max(1000).optional(),
        isPublic: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const dupe = await ctx.db
        .select({ id: collections.id })
        .from(collections)
        .where(
          and(
            eq(collections.userId, ctx.userId),
            eq(collections.slug, input.slug),
          ),
        )
        .limit(1);
      if (dupe.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Коллекция с таким slug уже есть",
        });
      }
      const [inserted] = await ctx.db
        .insert(collections)
        .values({
          userId: ctx.userId,
          name: input.name,
          slug: input.slug,
          description: input.description ?? null,
          isPublic: input.isPublic,
        })
        .returning({ id: collections.id, slug: collections.slug });
      return { id: inserted!.id, slug: inserted!.slug };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: collections.id, userId: collections.userId })
        .from(collections)
        .where(eq(collections.id, input.id))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.userId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.db.delete(collections).where(eq(collections.id, input.id));
      return { ok: true as const };
    }),

  addItem: protectedProcedure
    .input(
      z.object({
        collectionId: z.string().uuid(),
        targetType: targetSchema,
        targetId: z.string(),
        note: z.string().max(300).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [coll] = await ctx.db
        .select({ id: collections.id, userId: collections.userId })
        .from(collections)
        .where(eq(collections.id, input.collectionId))
        .limit(1);
      if (!coll) throw new TRPCError({ code: "NOT_FOUND" });
      if (coll.userId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      try {
        await ctx.db.insert(collectionItems).values({
          collectionId: input.collectionId,
          targetType: input.targetType,
          targetId: input.targetId,
          note: input.note ?? null,
        });
      } catch {
        // already in collection
      }
      return { ok: true as const };
    }),

  removeItem: protectedProcedure
    .input(
      z.object({
        collectionId: z.string().uuid(),
        targetType: targetSchema,
        targetId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [coll] = await ctx.db
        .select({ id: collections.id, userId: collections.userId })
        .from(collections)
        .where(eq(collections.id, input.collectionId))
        .limit(1);
      if (!coll) throw new TRPCError({ code: "NOT_FOUND" });
      if (coll.userId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.db
        .delete(collectionItems)
        .where(
          and(
            eq(collectionItems.collectionId, input.collectionId),
            eq(collectionItems.targetType, input.targetType),
            eq(collectionItems.targetId, input.targetId),
          ),
        );
      return { ok: true as const };
    }),
});
