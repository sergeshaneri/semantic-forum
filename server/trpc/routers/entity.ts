import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  findEntityBySlug,
  findTheory,
  findTheoryObject,
  findUser,
  listInterpretationsForEntity,
  mockEntities,
} from "@/lib/mock/data";
import { createTRPCRouter, publicProcedure } from "../init";

const langSchema = z.enum(["ru", "en"]);

export const entityRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        language: langSchema,
        kind: z.enum(["word", "person"]).optional(),
      }),
    )
    .query(({ input }) => {
      return mockEntities
        .filter((e) => e.language === input.language)
        .filter((e) => (input.kind ? e.kind === input.kind : true))
        .map((e) => ({
          ...e,
          interpretationCount: listInterpretationsForEntity(e.id).length,
        }));
    }),

  popular: publicProcedure
    .input(z.object({ language: langSchema, limit: z.number().default(4) }))
    .query(({ input }) => {
      return mockEntities
        .filter((e) => e.language === input.language)
        .map((e) => ({
          ...e,
          interpretationCount: listInterpretationsForEntity(e.id).length,
        }))
        .sort((a, b) => b.interpretationCount - a.interpretationCount)
        .slice(0, input.limit);
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string(), language: langSchema }))
    .query(({ input }) => {
      const entity = findEntityBySlug(input.slug, input.language);
      if (!entity) throw new TRPCError({ code: "NOT_FOUND" });

      const interpretations = listInterpretationsForEntity(entity.id).map(
        (i) => {
          const theory = findTheory(i.theoryId);
          const theoryObject = findTheoryObject(i.theoryObjectId);
          const author = findUser(i.authorId);
          return {
            ...i,
            theory: theory
              ? { id: theory.id, name: theory.name, slug: theory.slug }
              : null,
            theoryObject: theoryObject
              ? {
                  id: theoryObject.id,
                  name: theoryObject.name,
                  slug: theoryObject.slug,
                  metadata: theoryObject.metadata,
                }
              : null,
            author: author
              ? { id: author.id, username: author.username, name: author.name, karma: author.karma }
              : null,
          };
        },
      );

      return { entity, interpretations };
    }),
});
