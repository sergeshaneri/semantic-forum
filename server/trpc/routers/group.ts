import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import {
  groupMembers,
  groupPostComments,
  groupPosts,
  groups,
  votes,
} from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";

const langSchema = z.enum(["ru", "en"]);
const slugSchema = z
  .string()
  .min(2)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const groupRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({ language: langSchema, limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.query.groups.findMany({
        where: eq(groups.language, input.language),
        orderBy: [desc(groups.createdAt)],
        limit: input.limit,
        with: {
          owner: { columns: { username: true, name: true } },
          members: { columns: { userId: true } },
          posts: { columns: { id: true } },
        },
      });
      return rows.map((g) => ({
        id: g.id,
        slug: g.slug,
        name: g.name,
        description: g.description,
        isPrivate: g.isPrivate,
        memberCount: g.members.length,
        postCount: g.posts.length,
        owner: g.owner
          ? {
              username: g.owner.username ?? "",
              name: g.owner.name ?? "",
            }
          : null,
      }));
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string(), language: langSchema }))
    .query(async ({ ctx, input }) => {
      const group = await ctx.db.query.groups.findFirst({
        where: and(
          eq(groups.slug, input.slug),
          eq(groups.language, input.language),
        ),
        with: {
          owner: { columns: { id: true, username: true, name: true } },
          members: {
            columns: { role: true, joinedAt: true },
            with: {
              user: {
                columns: {
                  id: true,
                  username: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      });
      if (!group) throw new TRPCError({ code: "NOT_FOUND" });

      const viewerId = ctx.session?.user?.id ?? null;
      const isMember = viewerId
        ? group.members.some((m) => m.user?.id === viewerId)
        : false;
      const isOwner = viewerId === group.ownerId;

      const posts = await ctx.db.query.groupPosts.findMany({
        where: eq(groupPosts.groupId, group.id),
        orderBy: [desc(groupPosts.createdAt)],
        limit: 30,
        with: {
          author: { columns: { username: true, name: true } },
          comments: { columns: { id: true } },
        },
      });

      return {
        group: {
          id: group.id,
          slug: group.slug,
          name: group.name,
          description: group.description,
          isPrivate: group.isPrivate,
          ownerId: group.ownerId,
          createdAt: group.createdAt,
          isMember,
          isOwner,
        },
        owner: group.owner
          ? {
              id: group.owner.id,
              username: group.owner.username ?? "",
              name: group.owner.name ?? "",
            }
          : null,
        members: group.members
          .filter((m) => m.user)
          .map((m) => ({
            id: m.user!.id,
            username: m.user!.username ?? "",
            name: m.user!.name ?? "",
            image: m.user!.image ?? null,
            role: m.role,
            joinedAt: m.joinedAt,
          })),
        posts: posts.map((p) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          body: p.body,
          score: p.score,
          votesUp: p.votesUp,
          votesDown: p.votesDown,
          createdAt: p.createdAt,
          commentCount: p.comments.length,
          author: p.author
            ? {
                username: p.author.username ?? "",
                name: p.author.name ?? "",
              }
            : null,
        })),
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        slug: slugSchema,
        name: z.string().min(2).max(200),
        description: z.string().max(2000).optional(),
        language: langSchema,
        isPrivate: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const dupe = await ctx.db
        .select({ id: groups.id })
        .from(groups)
        .where(
          and(eq(groups.slug, input.slug), eq(groups.language, input.language)),
        )
        .limit(1);
      if (dupe.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Группа с таким slug уже есть",
        });
      }
      const [inserted] = await ctx.db
        .insert(groups)
        .values({
          slug: input.slug,
          name: input.name,
          description: input.description ?? null,
          language: input.language,
          ownerId: ctx.userId,
          isPrivate: input.isPrivate,
        })
        .returning({ id: groups.id, slug: groups.slug });
      await ctx.db.insert(groupMembers).values({
        groupId: inserted!.id,
        userId: ctx.userId,
        role: "owner",
      });
      return { id: inserted!.id, slug: inserted!.slug };
    }),

  join: protectedProcedure
    .input(z.object({ groupId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.insert(groupMembers).values({
          groupId: input.groupId,
          userId: ctx.userId,
          role: "member",
        });
      } catch {
        // already a member
      }
      return { ok: true as const };
    }),

  leave: protectedProcedure
    .input(z.object({ groupId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Owner can't leave their own group
      const [g] = await ctx.db
        .select({ ownerId: groups.ownerId })
        .from(groups)
        .where(eq(groups.id, input.groupId))
        .limit(1);
      if (g?.ownerId === ctx.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Владелец не может покинуть группу",
        });
      }
      await ctx.db
        .delete(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, input.groupId),
            eq(groupMembers.userId, ctx.userId),
          ),
        );
      return { ok: true as const };
    }),

  // --- Posts ---

  createPost: protectedProcedure
    .input(
      z.object({
        groupId: z.string().uuid(),
        title: z.string().min(2).max(300),
        slug: slugSchema,
        body: z.string().min(2).max(20000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [g] = await ctx.db
        .select({ id: groups.id, language: groups.language })
        .from(groups)
        .where(eq(groups.id, input.groupId))
        .limit(1);
      if (!g) throw new TRPCError({ code: "NOT_FOUND" });
      // Must be a member to post
      const [m] = await ctx.db
        .select({ userId: groupMembers.userId })
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, input.groupId),
            eq(groupMembers.userId, ctx.userId),
          ),
        )
        .limit(1);
      if (!m) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Только участники могут публиковать",
        });
      }
      const dupe = await ctx.db
        .select({ id: groupPosts.id })
        .from(groupPosts)
        .where(
          and(
            eq(groupPosts.groupId, input.groupId),
            eq(groupPosts.slug, input.slug),
          ),
        )
        .limit(1);
      if (dupe.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Пост с таким slug уже есть в этой группе",
        });
      }
      const [inserted] = await ctx.db
        .insert(groupPosts)
        .values({
          groupId: input.groupId,
          authorId: ctx.userId,
          title: input.title,
          slug: input.slug,
          body: input.body,
          language: g.language,
        })
        .returning({ id: groupPosts.id, slug: groupPosts.slug });
      return { id: inserted!.id, slug: inserted!.slug };
    }),

  getPost: publicProcedure
    .input(
      z.object({
        groupSlug: z.string(),
        postSlug: z.string(),
        language: langSchema,
      }),
    )
    .query(async ({ ctx, input }) => {
      const group = await ctx.db.query.groups.findFirst({
        where: and(
          eq(groups.slug, input.groupSlug),
          eq(groups.language, input.language),
        ),
        columns: { id: true, slug: true, name: true, language: true },
      });
      if (!group) throw new TRPCError({ code: "NOT_FOUND" });

      const post = await ctx.db.query.groupPosts.findFirst({
        where: and(
          eq(groupPosts.groupId, group.id),
          eq(groupPosts.slug, input.postSlug),
        ),
        with: {
          author: { columns: { id: true, username: true, name: true } },
          comments: {
            orderBy: (c, { asc }) => [asc(c.createdAt)],
            with: {
              author: { columns: { id: true, username: true, name: true } },
            },
          },
        },
      });
      if (!post) throw new TRPCError({ code: "NOT_FOUND" });

      const viewerId = ctx.session?.user?.id ?? null;
      let myVote: 1 | -1 | 0 = 0;
      if (viewerId) {
        const [v] = await ctx.db
          .select({ value: votes.value })
          .from(votes)
          .where(
            and(
              eq(votes.userId, viewerId),
              eq(votes.targetType, "group_post"),
              eq(votes.targetId, post.id),
            ),
          )
          .limit(1);
        if (v) myVote = v.value as 1 | -1;
      }

      return {
        group: {
          id: group.id,
          slug: group.slug,
          name: group.name,
        },
        post: {
          id: post.id,
          slug: post.slug,
          title: post.title,
          body: post.body,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          score: post.score,
          votesUp: post.votesUp,
          votesDown: post.votesDown,
          myVote,
          authorId: post.authorId,
          author: post.author
            ? {
                id: post.author.id,
                username: post.author.username ?? "",
                name: post.author.name ?? "",
              }
            : null,
        },
        comments: post.comments.map((c) => ({
          id: c.id,
          body: c.body,
          createdAt: c.createdAt,
          authorId: c.authorId,
          author: c.author
            ? {
                id: c.author.id,
                username: c.author.username ?? "",
                name: c.author.name ?? "",
              }
            : null,
        })),
      };
    }),

  deletePost: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [p] = await ctx.db
        .select({
          id: groupPosts.id,
          authorId: groupPosts.authorId,
          groupId: groupPosts.groupId,
        })
        .from(groupPosts)
        .where(eq(groupPosts.id, input.id))
        .limit(1);
      if (!p) throw new TRPCError({ code: "NOT_FOUND" });
      // Author OR group owner can delete
      let canDelete = p.authorId === ctx.userId;
      if (!canDelete) {
        const [g] = await ctx.db
          .select({ ownerId: groups.ownerId })
          .from(groups)
          .where(eq(groups.id, p.groupId))
          .limit(1);
        canDelete = g?.ownerId === ctx.userId;
      }
      if (!canDelete) throw new TRPCError({ code: "FORBIDDEN" });
      await ctx.db.delete(groupPosts).where(eq(groupPosts.id, input.id));
      return { ok: true as const };
    }),

  addComment: protectedProcedure
    .input(
      z.object({
        groupPostId: z.string().uuid(),
        body: z.string().min(1).max(4000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [p] = await ctx.db
        .select({ id: groupPosts.id, groupId: groupPosts.groupId })
        .from(groupPosts)
        .where(eq(groupPosts.id, input.groupPostId))
        .limit(1);
      if (!p) throw new TRPCError({ code: "NOT_FOUND" });
      const [m] = await ctx.db
        .select({ userId: groupMembers.userId })
        .from(groupMembers)
        .where(
          and(
            eq(groupMembers.groupId, p.groupId),
            eq(groupMembers.userId, ctx.userId),
          ),
        )
        .limit(1);
      if (!m) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Только участники могут комментировать",
        });
      }
      const [inserted] = await ctx.db
        .insert(groupPostComments)
        .values({
          groupPostId: input.groupPostId,
          authorId: ctx.userId,
          body: input.body,
        })
        .returning({ id: groupPostComments.id });
      return { id: inserted!.id };
    }),

  deleteComment: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [c] = await ctx.db
        .select({
          id: groupPostComments.id,
          authorId: groupPostComments.authorId,
        })
        .from(groupPostComments)
        .where(eq(groupPostComments.id, input.id))
        .limit(1);
      if (!c) throw new TRPCError({ code: "NOT_FOUND" });
      if (c.authorId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.db
        .delete(groupPostComments)
        .where(eq(groupPostComments.id, input.id));
      return { ok: true as const };
    }),
});
