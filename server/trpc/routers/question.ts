import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import {
  answers,
  notifications,
  questions,
  users,
} from "@/server/db/schema";
import { extractMentions } from "@/lib/mentions";
import { expandCitations } from "@/lib/citations";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";
import { inArray } from "drizzle-orm";

const langSchema = z.enum(["ru", "en"]);
const slugSchema = z
  .string()
  .min(2)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const questionRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        language: langSchema,
        resolved: z.boolean().optional(),
        limit: z.number().default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.query.questions.findMany({
        where: (q, { and: a, eq: e }) =>
          input.resolved === undefined
            ? e(q.language, input.language)
            : a(
                e(q.language, input.language),
                e(q.isResolved, input.resolved),
              ),
        orderBy: [desc(questions.createdAt)],
        limit: input.limit,
        with: {
          author: { columns: { username: true, name: true } },
          answers: { columns: { id: true } },
        },
      });
      return rows.map((q) => ({
        id: q.id,
        slug: q.slug,
        title: q.title,
        body: q.body,
        isResolved: q.isResolved,
        createdAt: q.createdAt,
        answerCount: q.answers.length,
        author: q.author
          ? {
              username: q.author.username ?? "",
              name: q.author.name ?? "",
            }
          : null,
      }));
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string(), language: langSchema }))
    .query(async ({ ctx, input }) => {
      const q = await ctx.db.query.questions.findFirst({
        where: and(
          eq(questions.slug, input.slug),
          eq(questions.language, input.language),
        ),
        with: {
          author: {
            columns: { id: true, username: true, name: true, image: true },
          },
          answers: {
            orderBy: [desc(answers.isAccepted), desc(answers.score)],
            with: {
              author: {
                columns: { id: true, username: true, name: true },
              },
            },
          },
        },
      });
      if (!q) throw new TRPCError({ code: "NOT_FOUND" });

      const expandedBody = await expandCitations(q.body, input.language);
      const expandedAnswers = await Promise.all(
        q.answers.map((a) => expandCitations(a.body, input.language)),
      );

      return {
        question: {
          id: q.id,
          slug: q.slug,
          title: q.title,
          body: expandedBody,
          isResolved: q.isResolved,
          createdAt: q.createdAt,
          updatedAt: q.updatedAt,
          authorId: q.authorId,
        },
        author: q.author,
        answers: q.answers.map((a, idx) => ({
          id: a.id,
          body: expandedAnswers[idx]!,
          isAccepted: a.isAccepted,
          votesUp: a.votesUp,
          votesDown: a.votesDown,
          score: a.score,
          createdAt: a.createdAt,
          authorId: a.authorId,
          author: a.author
            ? {
                id: a.author.id,
                username: a.author.username ?? "",
                name: a.author.name ?? "",
              }
            : null,
        })),
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(8).max(300),
        slug: slugSchema,
        body: z.string().min(20).max(10000),
        language: langSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const dupe = await ctx.db
        .select({ id: questions.id })
        .from(questions)
        .where(
          and(
            eq(questions.slug, input.slug),
            eq(questions.language, input.language),
          ),
        )
        .limit(1);
      if (dupe.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Вопрос с таким slug уже существует",
        });
      }
      const [inserted] = await ctx.db
        .insert(questions)
        .values({
          title: input.title,
          slug: input.slug,
          body: input.body,
          language: input.language,
          authorId: ctx.userId,
        })
        .returning({ id: questions.id, slug: questions.slug });
      return { id: inserted!.id, slug: inserted!.slug };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(8).max(300),
        body: z.string().min(20).max(10000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: questions.id, authorId: questions.authorId })
        .from(questions)
        .where(eq(questions.id, input.id))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.authorId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.db
        .update(questions)
        .set({
          title: input.title,
          body: input.body,
          updatedAt: new Date(),
        })
        .where(eq(questions.id, input.id));
      return { ok: true as const };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: questions.id, authorId: questions.authorId })
        .from(questions)
        .where(eq(questions.id, input.id))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.authorId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.db.delete(questions).where(eq(questions.id, input.id));
      return { ok: true as const };
    }),

  toggleResolved: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({
          id: questions.id,
          authorId: questions.authorId,
          isResolved: questions.isResolved,
        })
        .from(questions)
        .where(eq(questions.id, input.id))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.authorId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.db
        .update(questions)
        .set({ isResolved: !existing.isResolved })
        .where(eq(questions.id, input.id));
      return { ok: true as const };
    }),
});

export const answerRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        questionId: z.string().uuid(),
        body: z.string().min(20).max(10000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [q] = await ctx.db
        .select({
          id: questions.id,
          slug: questions.slug,
          language: questions.language,
          authorId: questions.authorId,
        })
        .from(questions)
        .where(eq(questions.id, input.questionId))
        .limit(1);
      if (!q) throw new TRPCError({ code: "NOT_FOUND" });

      const [inserted] = await ctx.db
        .insert(answers)
        .values({
          questionId: input.questionId,
          authorId: ctx.userId,
          body: input.body,
        })
        .returning({ id: answers.id });

      const url = `/${q.language}/questions/${q.slug}`;

      // Notify question author
      if (q.authorId && q.authorId !== ctx.userId) {
        await ctx.db.insert(notifications).values({
          recipientId: q.authorId,
          actorId: ctx.userId,
          type: "reply",
          targetType: "answer",
          targetId: inserted!.id,
          url,
          message: "ответил на твой вопрос",
        });
      }

      // @mentions
      const mentioned = extractMentions(input.body);
      if (mentioned.length > 0) {
        const targets = await ctx.db
          .select({ id: users.id })
          .from(users)
          .where(inArray(users.username, mentioned));
        for (const t of targets) {
          if (t.id === ctx.userId) continue;
          if (q.authorId === t.id) continue;
          await ctx.db.insert(notifications).values({
            recipientId: t.id,
            actorId: ctx.userId,
            type: "mention",
            targetType: "answer",
            targetId: inserted!.id,
            url,
            message: "упомянул тебя в ответе",
          });
        }
      }
      return { id: inserted!.id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        body: z.string().min(20).max(10000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: answers.id, authorId: answers.authorId })
        .from(answers)
        .where(eq(answers.id, input.id))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.authorId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.db
        .update(answers)
        .set({ body: input.body, updatedAt: new Date() })
        .where(eq(answers.id, input.id));
      return { ok: true as const };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: answers.id, authorId: answers.authorId })
        .from(answers)
        .where(eq(answers.id, input.id))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.authorId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.db.delete(answers).where(eq(answers.id, input.id));
      return { ok: true as const };
    }),

  accept: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [a] = await ctx.db
        .select({ id: answers.id, questionId: answers.questionId })
        .from(answers)
        .where(eq(answers.id, input.id))
        .limit(1);
      if (!a) throw new TRPCError({ code: "NOT_FOUND" });
      const [q] = await ctx.db
        .select({ id: questions.id, authorId: questions.authorId })
        .from(questions)
        .where(eq(questions.id, a.questionId))
        .limit(1);
      if (!q) throw new TRPCError({ code: "NOT_FOUND" });
      if (q.authorId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Принять ответ может только автор вопроса",
        });
      }
      // un-accept all answers on this question first
      await ctx.db
        .update(answers)
        .set({ isAccepted: false })
        .where(eq(answers.questionId, a.questionId));
      // accept this one
      await ctx.db
        .update(answers)
        .set({ isAccepted: true })
        .where(eq(answers.id, a.id));
      await ctx.db
        .update(questions)
        .set({ isResolved: true })
        .where(eq(questions.id, q.id));
      return { ok: true as const };
    }),
});
