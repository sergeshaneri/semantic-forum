import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { pollVotes, polls } from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";

const langSchema = z.enum(["ru", "en"]);
const slugSchema = z
  .string()
  .min(2)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const pollRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        language: langSchema,
        limit: z.number().default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.query.polls.findMany({
        where: eq(polls.language, input.language),
        orderBy: [desc(polls.createdAt)],
        limit: input.limit,
        with: {
          creator: { columns: { username: true, name: true } },
          votes: { columns: { userId: true } },
        },
      });
      return rows.map((p) => ({
        id: p.id,
        slug: p.slug,
        question: p.question,
        description: p.description,
        options: (p.options as string[]) ?? [],
        closesAt: p.closesAt,
        createdAt: p.createdAt,
        voteCount: p.votes.length,
        creator: p.creator
          ? {
              username: p.creator.username ?? "",
              name: p.creator.name ?? "",
            }
          : null,
      }));
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string(), language: langSchema }))
    .query(async ({ ctx, input }) => {
      const poll = await ctx.db.query.polls.findFirst({
        where: and(eq(polls.slug, input.slug), eq(polls.language, input.language)),
        with: {
          creator: { columns: { id: true, username: true, name: true } },
          votes: true,
        },
      });
      if (!poll) throw new TRPCError({ code: "NOT_FOUND" });

      const options = (poll.options as string[]) ?? [];
      const tallies = options.map((_, idx) =>
        poll.votes.filter((v) => v.optionIndex === idx).length,
      );
      const totalVotes = poll.votes.length;
      const viewerId = ctx.session?.user?.id ?? null;
      const myVote =
        viewerId !== null
          ? poll.votes.find((v) => v.userId === viewerId)?.optionIndex ?? null
          : null;
      const isClosed = poll.closesAt
        ? new Date(poll.closesAt).getTime() < Date.now()
        : false;

      return {
        poll: {
          id: poll.id,
          slug: poll.slug,
          question: poll.question,
          description: poll.description,
          options,
          tallies,
          totalVotes,
          myVote,
          isClosed,
          createdAt: poll.createdAt,
          closesAt: poll.closesAt,
        },
        creator: poll.creator
          ? {
              id: poll.creator.id,
              username: poll.creator.username ?? "",
              name: poll.creator.name ?? "",
            }
          : null,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        question: z.string().min(5).max(500),
        description: z.string().max(2000).optional(),
        slug: slugSchema,
        language: langSchema,
        options: z
          .array(z.string().min(1).max(200))
          .min(2)
          .max(20),
        closesAt: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const dupe = await ctx.db
        .select({ id: polls.id })
        .from(polls)
        .where(and(eq(polls.slug, input.slug), eq(polls.language, input.language)))
        .limit(1);
      if (dupe.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Опрос с таким slug уже есть",
        });
      }
      const [inserted] = await ctx.db
        .insert(polls)
        .values({
          slug: input.slug,
          question: input.question,
          description: input.description ?? null,
          language: input.language,
          options: input.options,
          createdBy: ctx.userId,
          closesAt: input.closesAt ?? null,
        })
        .returning({ id: polls.id, slug: polls.slug });
      return { id: inserted!.id, slug: inserted!.slug };
    }),

  vote: protectedProcedure
    .input(
      z.object({
        pollId: z.string().uuid(),
        optionIndex: z.number().int().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [poll] = await ctx.db
        .select({
          id: polls.id,
          options: polls.options,
          closesAt: polls.closesAt,
        })
        .from(polls)
        .where(eq(polls.id, input.pollId))
        .limit(1);
      if (!poll) throw new TRPCError({ code: "NOT_FOUND" });
      const opts = (poll.options as string[]) ?? [];
      if (input.optionIndex >= opts.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Нет такого варианта",
        });
      }
      if (poll.closesAt && new Date(poll.closesAt).getTime() < Date.now()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Голосование закрыто",
        });
      }

      // Upsert: remove old vote if any, then insert
      await ctx.db
        .delete(pollVotes)
        .where(
          and(
            eq(pollVotes.pollId, input.pollId),
            eq(pollVotes.userId, ctx.userId),
          ),
        );
      await ctx.db.insert(pollVotes).values({
        pollId: input.pollId,
        userId: ctx.userId,
        optionIndex: input.optionIndex,
      });
      return { ok: true as const };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [poll] = await ctx.db
        .select({ id: polls.id, createdBy: polls.createdBy })
        .from(polls)
        .where(eq(polls.id, input.id))
        .limit(1);
      if (!poll) throw new TRPCError({ code: "NOT_FOUND" });
      if (poll.createdBy !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.db.delete(polls).where(eq(polls.id, input.id));
      return { ok: true as const };
    }),
});
