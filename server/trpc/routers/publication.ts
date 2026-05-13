import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import {
  publicationReferences,
  publicationTags,
  publications,
  tags,
  users,
} from "@/server/db/schema";
import { expandCitations } from "@/lib/citations";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "../init";

const langSchema = z.enum(["ru", "en"]);
const kindSchema = z.enum(["article", "video"]);
const refTargetSchema = z.enum(["entity", "theory", "theory_object"]);
const slugSchema = z
  .string()
  .min(2)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

async function upsertTags(
  db: typeof import("@/server/db").db,
  rawTags: string[],
  language: "ru" | "en",
): Promise<string[]> {
  const cleaned = Array.from(
    new Set(
      rawTags
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length >= 2 && t.length <= 50),
    ),
  );
  if (cleaned.length === 0) return [];

  const slugs = cleaned.map((t) =>
    t.replace(/\s+/g, "-").replace(/[^a-zа-яё0-9-]/gi, ""),
  );

  const existing = await db
    .select({ id: tags.id, slug: tags.slug })
    .from(tags)
    .where(and(eq(tags.language, language), inArray(tags.slug, slugs)));
  const existingBySlug = new Map(existing.map((t) => [t.slug, t.id]));

  const ids: string[] = [];
  for (let i = 0; i < cleaned.length; i++) {
    const slug = slugs[i]!;
    const label = cleaned[i]!;
    let id = existingBySlug.get(slug);
    if (!id) {
      const [inserted] = await db
        .insert(tags)
        .values({ slug, label, language })
        .returning({ id: tags.id });
      id = inserted!.id;
    }
    ids.push(id);
  }
  return ids;
}

export const publicationRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        language: langSchema,
        authorId: z.string().optional(),
        kind: kindSchema.optional(),
        limit: z.number().default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db.query.publications.findMany({
        where: (p, { and: a, eq: e }) => {
          const conds = [e(p.language, input.language)];
          if (input.authorId) conds.push(e(p.authorId, input.authorId));
          if (input.kind) conds.push(e(p.kind, input.kind));
          return a(...conds);
        },
        orderBy: [desc(publications.createdAt)],
        limit: input.limit,
        with: {
          author: { columns: { username: true, name: true, image: true } },
          tags: { with: { tag: true } },
        },
      });
      return rows.map((p) => ({
        id: p.id,
        kind: p.kind,
        title: p.title,
        slug: p.slug,
        body: p.body,
        externalUrl: p.externalUrl,
        createdAt: p.createdAt,
        author: p.author
          ? {
              username: p.author.username ?? "",
              name: p.author.name ?? "",
              image: p.author.image ?? null,
            }
          : null,
        tags: p.tags.map((pt) => ({
          id: pt.tag.id,
          slug: pt.tag.slug,
          label: pt.tag.label,
        })),
      }));
    }),

  getBySlug: publicProcedure
    .input(
      z.object({
        username: z.string(),
        slug: z.string(),
        language: langSchema,
      }),
    )
    .query(async ({ ctx, input }) => {
      const author = await ctx.db.query.users.findFirst({
        where: eq(users.username, input.username),
        columns: { id: true, username: true, name: true, image: true },
      });
      if (!author) throw new TRPCError({ code: "NOT_FOUND" });

      const publication = await ctx.db.query.publications.findFirst({
        where: and(
          eq(publications.authorId, author.id),
          eq(publications.slug, input.slug),
          eq(publications.language, input.language),
        ),
        with: {
          tags: { with: { tag: true } },
          references: true,
        },
      });
      if (!publication) throw new TRPCError({ code: "NOT_FOUND" });

      // Resolve references
      const entityIds = publication.references
        .filter((r) => r.targetType === "entity")
        .map((r) => r.targetId);
      const theoryIds = publication.references
        .filter((r) => r.targetType === "theory")
        .map((r) => r.targetId);
      const objectIds = publication.references
        .filter((r) => r.targetType === "theory_object")
        .map((r) => r.targetId);

      const [resolvedEntities, resolvedTheories, resolvedObjects] =
        await Promise.all([
          entityIds.length > 0
            ? ctx.db.query.entities.findMany({
                where: (e, { inArray: i }) => i(e.id, entityIds),
                columns: { id: true, slug: true, title: true },
              })
            : Promise.resolve([]),
          theoryIds.length > 0
            ? ctx.db.query.theories.findMany({
                where: (t, { inArray: i }) => i(t.id, theoryIds),
                columns: { id: true, slug: true, name: true },
              })
            : Promise.resolve([]),
          objectIds.length > 0
            ? ctx.db.query.theoryObjects.findMany({
                where: (o, { inArray: i }) => i(o.id, objectIds),
                columns: { id: true, slug: true, name: true, theoryId: true },
                with: { theory: { columns: { slug: true, name: true } } },
              })
            : Promise.resolve([]),
        ]);

      const expandedBody = await expandCitations(
        publication.body,
        input.language,
      );

      return {
        publication: {
          id: publication.id,
          kind: publication.kind,
          title: publication.title,
          slug: publication.slug,
          body: expandedBody,
          externalUrl: publication.externalUrl,
          createdAt: publication.createdAt,
          updatedAt: publication.updatedAt,
          authorId: publication.authorId,
        },
        author,
        tags: publication.tags.map((pt) => ({
          id: pt.tag.id,
          slug: pt.tag.slug,
          label: pt.tag.label,
        })),
        references: {
          entities: resolvedEntities,
          theories: resolvedTheories,
          objects: resolvedObjects.map((o) => ({
            id: o.id,
            slug: o.slug,
            name: o.name,
            theory: o.theory,
          })),
        },
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        kind: kindSchema,
        title: z.string().min(2).max(300),
        slug: slugSchema,
        body: z.string().min(20).max(50000),
        externalUrl: z.string().url().optional().or(z.literal("")),
        language: langSchema,
        tags: z.array(z.string()).default([]),
        references: z
          .array(
            z.object({
              targetType: refTargetSchema,
              targetId: z.string().uuid(),
              note: z.string().max(200).optional(),
            }),
          )
          .default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const dupe = await ctx.db
        .select({ id: publications.id })
        .from(publications)
        .where(
          and(
            eq(publications.authorId, ctx.userId),
            eq(publications.slug, input.slug),
          ),
        )
        .limit(1);
      if (dupe.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "У тебя уже есть публикация с таким slug",
        });
      }

      const [inserted] = await ctx.db
        .insert(publications)
        .values({
          authorId: ctx.userId,
          kind: input.kind,
          title: input.title,
          slug: input.slug,
          body: input.body,
          externalUrl: input.externalUrl || null,
          language: input.language,
        })
        .returning({ id: publications.id, slug: publications.slug });

      const pubId = inserted!.id;

      if (input.tags.length > 0) {
        const tagIds = await upsertTags(ctx.db, input.tags, input.language);
        if (tagIds.length > 0) {
          await ctx.db
            .insert(publicationTags)
            .values(tagIds.map((tagId) => ({ publicationId: pubId, tagId })));
        }
      }

      if (input.references.length > 0) {
        await ctx.db.insert(publicationReferences).values(
          input.references.map((r) => ({
            publicationId: pubId,
            targetType: r.targetType,
            targetId: r.targetId,
            note: r.note ?? null,
          })),
        );
      }

      return { id: pubId, slug: inserted!.slug };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(2).max(300),
        body: z.string().min(20).max(50000),
        externalUrl: z.string().url().optional().or(z.literal("")),
        tags: z.array(z.string()).default([]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({
          id: publications.id,
          authorId: publications.authorId,
          language: publications.language,
        })
        .from(publications)
        .where(eq(publications.id, input.id))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.authorId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Только автор может править",
        });
      }
      await ctx.db
        .update(publications)
        .set({
          title: input.title,
          body: input.body,
          externalUrl: input.externalUrl || null,
          updatedAt: new Date(),
        })
        .where(eq(publications.id, input.id));

      // Replace tags
      await ctx.db
        .delete(publicationTags)
        .where(eq(publicationTags.publicationId, input.id));
      if (input.tags.length > 0) {
        const tagIds = await upsertTags(ctx.db, input.tags, existing.language);
        if (tagIds.length > 0) {
          await ctx.db
            .insert(publicationTags)
            .values(
              tagIds.map((tagId) => ({ publicationId: input.id, tagId })),
            );
        }
      }

      return { ok: true as const };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select({ id: publications.id, authorId: publications.authorId })
        .from(publications)
        .where(eq(publications.id, input.id))
        .limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
      if (existing.authorId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Только автор может удалить",
        });
      }
      await ctx.db.delete(publications).where(eq(publications.id, input.id));
      return { ok: true as const };
    }),
});
