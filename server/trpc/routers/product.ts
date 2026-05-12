import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { productReviews, products, users } from "@/server/db/schema";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../init";

const langSchema = z.enum(["ru", "en"]);
const kindSchema = z.enum([
  "course",
  "consultation",
  "book",
  "typing",
  "workshop",
  "other",
]);

export const productRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        language: langSchema,
        ownerId: z.string().optional(),
        limit: z.number().default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.query.products.findMany({
        where: (p, { and: a, eq: e }) =>
          input.ownerId
            ? a(e(p.language, input.language), e(p.ownerId, input.ownerId))
            : e(p.language, input.language),
        orderBy: [desc(products.createdAt)],
        limit: input.limit,
        with: {
          owner: { columns: { username: true, name: true, image: true } },
        },
      });

      if (rows.length === 0) return [];

      const ids = rows.map((p) => p.id);
      const aggRaw = await ctx.db
        .select({
          productId: productReviews.productId,
          avg: sql<number>`avg(${productReviews.rating})::float`,
          c: count(),
        })
        .from(productReviews)
        .where(sql`${productReviews.productId} = ANY(${ids})`)
        .groupBy(productReviews.productId);
      const aggByProduct = new Map(
        aggRaw.map((r) => [r.productId, { avg: Number(r.avg), count: Number(r.c) }]),
      );

      return rows.map((p) => {
        const agg = aggByProduct.get(p.id);
        return {
          id: p.id,
          kind: p.kind,
          title: p.title,
          description: p.description,
          priceCents: p.priceCents,
          currency: p.currency,
          url: p.url,
          createdAt: p.createdAt,
          owner: p.owner
            ? {
                username: p.owner.username ?? "",
                name: p.owner.name ?? "",
                image: p.owner.image ?? null,
              }
            : null,
          reviewCount: agg?.count ?? 0,
          ratingAvg: agg?.avg ?? null,
        };
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.query.products.findFirst({
        where: eq(products.id, input.id),
        with: {
          owner: {
            columns: { id: true, username: true, name: true, image: true },
          },
          reviews: {
            orderBy: [desc(productReviews.createdAt)],
            with: {
              author: { columns: { username: true, name: true } },
            },
          },
        },
      });
      if (!product) throw new TRPCError({ code: "NOT_FOUND" });

      const ratings = product.reviews.map((r) => r.rating);
      const ratingAvg =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : null;

      const viewerId = ctx.session?.user?.id ?? null;
      const viewerReview = viewerId
        ? product.reviews.find((r) => r.authorId === viewerId) ?? null
        : null;

      return {
        product: {
          id: product.id,
          kind: product.kind,
          title: product.title,
          description: product.description,
          priceCents: product.priceCents,
          currency: product.currency,
          url: product.url,
          ownerId: product.ownerId,
          createdAt: product.createdAt,
        },
        owner: product.owner,
        reviews: product.reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          body: r.body,
          createdAt: r.createdAt,
          authorId: r.authorId,
          author: r.author
            ? {
                username: r.author.username ?? "",
                name: r.author.name ?? "",
              }
            : null,
        })),
        ratingAvg,
        reviewCount: ratings.length,
        viewerReview: viewerReview
          ? { id: viewerReview.id, rating: viewerReview.rating, body: viewerReview.body }
          : null,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        kind: kindSchema,
        title: z.string().min(2).max(300),
        description: z.string().min(20).max(5000),
        priceCents: z.number().int().min(0).max(100_000_000).optional(),
        currency: z
          .string()
          .length(3)
          .regex(/^[A-Z]{3}$/)
          .optional(),
        url: z.string().url().max(500).optional().or(z.literal("")),
        language: langSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [inserted] = await ctx.db
        .insert(products)
        .values({
          ownerId: ctx.userId,
          kind: input.kind,
          title: input.title,
          description: input.description,
          priceCents: input.priceCents ?? null,
          currency: input.currency ?? null,
          url: input.url || null,
          language: input.language,
        })
        .returning({ id: products.id });
      return { id: inserted!.id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        kind: kindSchema,
        title: z.string().min(2).max(300),
        description: z.string().min(20).max(5000),
        priceCents: z.number().int().min(0).max(100_000_000).optional(),
        currency: z
          .string()
          .length(3)
          .regex(/^[A-Z]{3}$/)
          .optional(),
        url: z.string().url().max(500).optional().or(z.literal("")),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: products.id, ownerId: products.ownerId })
        .from(products)
        .where(eq(products.id, input.id))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.ownerId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.db
        .update(products)
        .set({
          kind: input.kind,
          title: input.title,
          description: input.description,
          priceCents: input.priceCents ?? null,
          currency: input.currency ?? null,
          url: input.url || null,
          updatedAt: new Date(),
        })
        .where(eq(products.id, input.id));
      return { ok: true as const };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: products.id, ownerId: products.ownerId })
        .from(products)
        .where(eq(products.id, input.id))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.ownerId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.db.delete(products).where(eq(products.id, input.id));
      return { ok: true as const };
    }),

  // --- Reviews ---

  reviewUpsert: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
        rating: z.number().int().min(1).max(5),
        body: z.string().min(10).max(3000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [product] = await ctx.db
        .select({ id: products.id, ownerId: products.ownerId })
        .from(products)
        .where(eq(products.id, input.productId))
        .limit(1);
      if (!product) throw new TRPCError({ code: "NOT_FOUND" });
      if (product.ownerId === ctx.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Нельзя оставить отзыв на свой продукт",
        });
      }

      const [existing] = await ctx.db
        .select({ id: productReviews.id })
        .from(productReviews)
        .where(
          and(
            eq(productReviews.productId, input.productId),
            eq(productReviews.authorId, ctx.userId),
          ),
        )
        .limit(1);

      if (existing) {
        await ctx.db
          .update(productReviews)
          .set({
            rating: input.rating,
            body: input.body,
            updatedAt: new Date(),
          })
          .where(eq(productReviews.id, existing.id));
      } else {
        await ctx.db.insert(productReviews).values({
          productId: input.productId,
          authorId: ctx.userId,
          rating: input.rating,
          body: input.body,
        });
      }
      return { ok: true as const };
    }),

  reviewDelete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: productReviews.id, authorId: productReviews.authorId })
        .from(productReviews)
        .where(eq(productReviews.id, input.id))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.authorId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.db
        .delete(productReviews)
        .where(eq(productReviews.id, input.id));
      return { ok: true as const };
    }),
});
