import { TRPCError } from "@trpc/server";
import { and, count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import {
  schoolSources,
  schools,
  sources,
  userSchools,
  users,
} from "@/server/db/schema";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../init";

const langSchema = z.enum(["ru", "en"]);
const slugSchema = z
  .string()
  .min(2)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

async function assertEditableSchool(
  db: typeof import("@/server/db").db,
  schoolId: string,
  userId: string,
) {
  const [s] = await db
    .select({ id: schools.id, createdBy: schools.createdBy, isSeed: schools.isSeed })
    .from(schools)
    .where(eq(schools.id, schoolId))
    .limit(1);
  if (!s) throw new TRPCError({ code: "NOT_FOUND" });
  if (s.isSeed) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Сид-школу нельзя редактировать.",
    });
  }
  if (s.createdBy !== userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Редактировать может только создатель школы.",
    });
  }
}

export const schoolRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({ language: langSchema }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.query.schools.findMany({
        where: eq(schools.language, input.language),
        with: {
          creator: { columns: { id: true, username: true, name: true } },
          sources: { columns: { sourceId: true } },
          members: { columns: { userId: true } },
        },
        orderBy: [desc(schools.isSeed), desc(schools.createdAt)],
      });
      return rows.map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.name,
        description: s.description,
        foundedYear: s.foundedYear,
        foundedPlace: s.foundedPlace,
        founderName: s.founderName,
        websiteUrl: s.websiteUrl,
        isSeed: s.isSeed,
        sourceCount: s.sources.length,
        memberCount: s.members.length,
        creator: s.creator
          ? {
              username: s.creator.username ?? "",
              name: s.creator.name ?? "",
            }
          : null,
      }));
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string(), language: langSchema }))
    .query(async ({ ctx, input }) => {
      const school = await ctx.db.query.schools.findFirst({
        where: and(
          eq(schools.slug, input.slug),
          eq(schools.language, input.language),
        ),
        with: {
          creator: { columns: { id: true, username: true, name: true } },
          sources: {
            with: { source: true },
          },
          members: {
            with: {
              user: {
                columns: { id: true, username: true, name: true, image: true },
              },
            },
          },
        },
      });
      if (!school) throw new TRPCError({ code: "NOT_FOUND" });
      return {
        school: {
          id: school.id,
          slug: school.slug,
          name: school.name,
          description: school.description,
          foundedYear: school.foundedYear,
          foundedPlace: school.foundedPlace,
          founderName: school.founderName,
          websiteUrl: school.websiteUrl,
          isSeed: school.isSeed,
          createdBy: school.createdBy,
          creator: school.creator
            ? {
                id: school.creator.id,
                username: school.creator.username ?? "",
                name: school.creator.name ?? "",
              }
            : null,
        },
        sources: school.sources.map((ss) => ({
          id: ss.source.id,
          kind: ss.source.kind,
          title: ss.source.title,
          authorNames: ss.source.authorNames,
          year: ss.source.year,
          url: ss.source.url,
          description: ss.source.description,
          note: ss.note,
        })),
        members: school.members.map((m) => ({
          id: m.user?.id ?? "",
          username: m.user?.username ?? "",
          name: m.user?.name ?? "",
          image: m.user?.image ?? null,
        })),
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(300),
        slug: slugSchema,
        description: z.string().min(20).max(5000),
        language: langSchema,
        foundedYear: z.number().int().min(1800).max(2100).optional(),
        foundedPlace: z.string().max(200).optional(),
        founderName: z.string().max(200).optional(),
        websiteUrl: z.string().url().max(500).optional().or(z.literal("")),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const dupe = await ctx.db
        .select({ id: schools.id })
        .from(schools)
        .where(
          and(
            eq(schools.slug, input.slug),
            eq(schools.language, input.language),
          ),
        )
        .limit(1);
      if (dupe.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Школа с таким slug уже существует",
        });
      }
      const [inserted] = await ctx.db
        .insert(schools)
        .values({
          name: input.name,
          slug: input.slug,
          description: input.description,
          language: input.language,
          foundedYear: input.foundedYear ?? null,
          foundedPlace: input.foundedPlace ?? null,
          founderName: input.founderName ?? null,
          websiteUrl: input.websiteUrl || null,
          createdBy: ctx.userId,
        })
        .returning({ id: schools.id, slug: schools.slug });
      return { id: inserted!.id, slug: inserted!.slug };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(2).max(300),
        description: z.string().min(20).max(5000),
        foundedYear: z.number().int().min(1800).max(2100).optional(),
        foundedPlace: z.string().max(200).optional(),
        founderName: z.string().max(200).optional(),
        websiteUrl: z.string().url().max(500).optional().or(z.literal("")),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertEditableSchool(ctx.db, input.id, ctx.userId);
      await ctx.db
        .update(schools)
        .set({
          name: input.name,
          description: input.description,
          foundedYear: input.foundedYear ?? null,
          foundedPlace: input.foundedPlace ?? null,
          founderName: input.founderName ?? null,
          websiteUrl: input.websiteUrl || null,
        })
        .where(eq(schools.id, input.id));
      return { ok: true as const };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await assertEditableSchool(ctx.db, input.id, ctx.userId);
      await ctx.db.delete(schools).where(eq(schools.id, input.id));
      return { ok: true as const };
    }),

  addSource: protectedProcedure
    .input(
      z.object({
        schoolId: z.string().uuid(),
        sourceId: z.string().uuid(),
        note: z.string().max(200).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertEditableSchool(ctx.db, input.schoolId, ctx.userId);
      try {
        await ctx.db.insert(schoolSources).values({
          schoolId: input.schoolId,
          sourceId: input.sourceId,
          note: input.note ?? null,
        });
      } catch {
        // already linked
      }
      return { ok: true as const };
    }),

  removeSource: protectedProcedure
    .input(
      z.object({
        schoolId: z.string().uuid(),
        sourceId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertEditableSchool(ctx.db, input.schoolId, ctx.userId);
      await ctx.db
        .delete(schoolSources)
        .where(
          and(
            eq(schoolSources.schoolId, input.schoolId),
            eq(schoolSources.sourceId, input.sourceId),
          ),
        );
      return { ok: true as const };
    }),

  joinAsMember: protectedProcedure
    .input(z.object({ schoolId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.insert(userSchools).values({
          userId: ctx.userId,
          schoolId: input.schoolId,
        });
      } catch {
        // already member
      }
      return { ok: true as const };
    }),

  leave: protectedProcedure
    .input(z.object({ schoolId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(userSchools)
        .where(
          and(
            eq(userSchools.userId, ctx.userId),
            eq(userSchools.schoolId, input.schoolId),
          ),
        );
      return { ok: true as const };
    }),
});

export const sourceRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({ language: langSchema, limit: z.number().default(200) }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select()
        .from(sources)
        .where(eq(sources.language, input.language))
        .orderBy(desc(sources.createdAt))
        .limit(input.limit);
      return rows.map((s) => ({
        id: s.id,
        kind: s.kind,
        title: s.title,
        authorNames: s.authorNames,
        year: s.year,
        url: s.url,
        isbn: s.isbn,
        description: s.description,
      }));
    }),

  create: protectedProcedure
    .input(
      z.object({
        kind: z.enum([
          "book",
          "article",
          "paper",
          "video",
          "podcast",
          "website",
          "other",
        ]),
        title: z.string().min(2).max(500),
        authorNames: z.string().max(500).optional(),
        year: z.number().int().min(0).max(2100).optional(),
        url: z.string().url().max(500).optional().or(z.literal("")),
        isbn: z.string().max(20).optional(),
        description: z.string().max(2000).optional(),
        language: langSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [inserted] = await ctx.db
        .insert(sources)
        .values({
          kind: input.kind,
          title: input.title,
          authorNames: input.authorNames ?? null,
          year: input.year ?? null,
          url: input.url || null,
          isbn: input.isbn ?? null,
          description: input.description ?? null,
          language: input.language,
          addedBy: ctx.userId,
        })
        .returning({ id: sources.id });
      return { id: inserted!.id };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: sources.id, addedBy: sources.addedBy })
        .from(sources)
        .where(eq(sources.id, input.id))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.addedBy !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      await ctx.db.delete(sources).where(eq(sources.id, input.id));
      return { ok: true as const };
    }),
});
