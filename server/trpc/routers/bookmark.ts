import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { bookmarks } from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../init";

const TARGET_VALUES = [
  "entity",
  "interpretation",
  "theory",
  "theory_object",
  "publication",
  "product",
] as const;
type TargetValue = (typeof TARGET_VALUES)[number];
const targetSchema = z.enum(TARGET_VALUES);

export const bookmarkRouter = createTRPCRouter({
  toggle: protectedProcedure
    .input(
      z.object({
        targetType: targetSchema,
        targetId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db
        .select()
        .from(bookmarks)
        .where(
          and(
            eq(bookmarks.userId, ctx.userId),
            eq(bookmarks.targetType, input.targetType),
            eq(bookmarks.targetId, input.targetId),
          ),
        )
        .limit(1);
      if (existing.length > 0) {
        await ctx.db
          .delete(bookmarks)
          .where(
            and(
              eq(bookmarks.userId, ctx.userId),
              eq(bookmarks.targetType, input.targetType),
              eq(bookmarks.targetId, input.targetId),
            ),
          );
        return { bookmarked: false as const };
      }
      await ctx.db.insert(bookmarks).values({
        userId: ctx.userId,
        targetType: input.targetType,
        targetId: input.targetId,
      });
      return { bookmarked: true as const };
    }),

  myList: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, ctx.userId))
      .orderBy(desc(bookmarks.createdAt));

    // Resolve each bookmark to a displayable item
    const result: Array<{
      targetType: TargetValue;
      targetId: string;
      title: string;
      subtitle: string | null;
      href: string;
      createdAt: Date;
    }> = [];

    for (const b of rows) {
      try {
        if (b.targetType === "entity") {
          const e = await ctx.db.query.entities.findFirst({
            where: (en, { eq: e2 }) => e2(en.id, b.targetId),
            columns: { slug: true, title: true, kind: true, language: true },
          });
          if (e) {
            result.push({
              targetType: b.targetType,
              targetId: b.targetId,
              title: e.title,
              subtitle: e.kind,
              href: `/${e.language}/entities/${e.slug}`,
              createdAt: b.createdAt,
            });
          }
        } else if (b.targetType === "interpretation") {
          const i = await ctx.db.query.interpretations.findFirst({
            where: (ip, { eq: e2 }) => e2(ip.id, b.targetId),
            columns: { body: true, language: true },
            with: {
              entity: { columns: { slug: true, title: true } },
            },
          });
          if (i?.entity) {
            result.push({
              targetType: b.targetType,
              targetId: b.targetId,
              title: i.body.slice(0, 80) + (i.body.length > 80 ? "…" : ""),
              subtitle: i.entity.title,
              href: `/${i.language}/entities/${i.entity.slug}`,
              createdAt: b.createdAt,
            });
          }
        } else if (b.targetType === "theory") {
          const t = await ctx.db.query.theories.findFirst({
            where: (th, { eq: e2 }) => e2(th.id, b.targetId),
            columns: { slug: true, name: true, language: true },
          });
          if (t) {
            result.push({
              targetType: b.targetType,
              targetId: b.targetId,
              title: t.name,
              subtitle: null,
              href: `/${t.language}/theories/${t.slug}`,
              createdAt: b.createdAt,
            });
          }
        } else if (b.targetType === "theory_object") {
          const o = await ctx.db.query.theoryObjects.findFirst({
            where: (to, { eq: e2 }) => e2(to.id, b.targetId),
            columns: { slug: true, name: true, language: true },
            with: { theory: { columns: { slug: true, name: true } } },
          });
          if (o?.theory) {
            result.push({
              targetType: b.targetType,
              targetId: b.targetId,
              title: o.name,
              subtitle: o.theory.name,
              href: `/${o.language}/theories/${o.theory.slug}/objects/${o.slug}`,
              createdAt: b.createdAt,
            });
          }
        } else if (b.targetType === "publication") {
          const p = await ctx.db.query.publications.findFirst({
            where: (pb, { eq: e2 }) => e2(pb.id, b.targetId),
            columns: { slug: true, title: true, kind: true, language: true },
            with: { author: { columns: { username: true } } },
          });
          if (p?.author?.username) {
            result.push({
              targetType: b.targetType,
              targetId: b.targetId,
              title: p.title,
              subtitle: p.kind,
              href: `/${p.language}/u/${p.author.username}/p/${p.slug}`,
              createdAt: b.createdAt,
            });
          }
        } else if (b.targetType === "product") {
          const p = await ctx.db.query.products.findFirst({
            where: (pr, { eq: e2 }) => e2(pr.id, b.targetId),
            columns: { id: true, title: true, kind: true, language: true },
            with: { owner: { columns: { username: true } } },
          });
          if (p?.owner?.username) {
            result.push({
              targetType: b.targetType,
              targetId: b.targetId,
              title: p.title,
              subtitle: p.kind,
              href: `/${p.language}/u/${p.owner.username}/products/${p.id}`,
              createdAt: b.createdAt,
            });
          }
        }
      } catch {
        // skip broken
      }
    }
    return result;
  }),

  check: protectedProcedure
    .input(
      z.object({
        targetType: targetSchema,
        targetId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select({ targetId: bookmarks.targetId })
        .from(bookmarks)
        .where(
          and(
            eq(bookmarks.userId, ctx.userId),
            eq(bookmarks.targetType, input.targetType),
            eq(bookmarks.targetId, input.targetId),
          ),
        )
        .limit(1);
      return { bookmarked: Boolean(row) };
    }),
});
