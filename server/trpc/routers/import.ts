import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { publications } from "@/server/db/schema";
import { importFromUrl } from "@/lib/import-url";
import { slugify } from "@/lib/slug";
import { createTRPCRouter, protectedProcedure } from "../init";

const langSchema = z.enum(["ru", "en"]);
const MAX_BODY = 50_000;

export const importRouter = createTRPCRouter({
  preview: protectedProcedure
    .input(z.object({ url: z.string().url().max(2000) }))
    .mutation(async ({ input }) => {
      try {
        const parsed = await importFromUrl(input.url);
        return {
          source: parsed.source,
          title: parsed.title,
          body: parsed.body.slice(0, MAX_BODY),
          sourceUrl: parsed.sourceUrl,
        };
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            err instanceof Error ? err.message : "Не удалось получить страницу",
        });
      }
    }),

  asPublication: protectedProcedure
    .input(
      z.object({
        url: z.string().url().max(2000),
        language: langSchema,
        slug: z
          .string()
          .min(2)
          .max(200)
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let parsed;
      try {
        parsed = await importFromUrl(input.url);
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            err instanceof Error ? err.message : "Не удалось получить страницу",
        });
      }

      const titleClipped = parsed.title.slice(0, 300).trim() || "Импорт";
      const generated = slugify(titleClipped);
      const baseSlug =
        input.slug || (generated && generated.length > 0 ? generated : `import-${Date.now()}`);

      // Resolve a unique slug per author
      let slug = baseSlug.slice(0, 200);
      let suffix = 0;
      // Try up to 5 collision-resolution attempts.
      for (let i = 0; i < 5; i++) {
        const dupe = await ctx.db
          .select({ id: publications.id })
          .from(publications)
          .where(
            and(
              eq(publications.authorId, ctx.userId),
              eq(publications.slug, slug),
            ),
          )
          .limit(1);
        if (dupe.length === 0) break;
        suffix++;
        slug = `${baseSlug.slice(0, 190)}-${suffix}`;
      }

      const bodyClipped = parsed.body.slice(0, MAX_BODY);
      const body = `${bodyClipped}\n\n— [Источник](${parsed.sourceUrl})`;

      const [inserted] = await ctx.db
        .insert(publications)
        .values({
          authorId: ctx.userId,
          kind: "article",
          title: titleClipped,
          slug,
          body,
          externalUrl: parsed.sourceUrl,
          language: input.language,
        })
        .returning({ id: publications.id, slug: publications.slug });

      return {
        id: inserted!.id,
        slug: inserted!.slug,
        source: parsed.source,
      };
    }),
});
