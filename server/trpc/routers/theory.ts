import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  findTheory,
  findTheoryBySlug,
  findTheoryObjectBySlug,
  findUser,
  listCitationsForObject,
  listInterpretationsForTheory,
  listTheoryObjects,
  mockTheories,
} from "@/lib/mock/data";
import { createTRPCRouter, publicProcedure } from "../init";

const langSchema = z.enum(["ru", "en"]);

export const theoryRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({ language: langSchema }))
    .query(({ input }) =>
      mockTheories
        .filter((t) => t.language === input.language)
        .map((t) => ({
          ...t,
          author: t.authorId ? findUser(t.authorId) : null,
          parentTheory: t.parentTheoryId ? findTheory(t.parentTheoryId) : null,
          objectCount: listTheoryObjects(t.id).length,
        })),
    ),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string(), language: langSchema }))
    .query(({ input }) => {
      const theory = findTheoryBySlug(input.slug, input.language);
      if (!theory) throw new TRPCError({ code: "NOT_FOUND" });
      const objects = listTheoryObjects(theory.id);
      const interpretations = listInterpretationsForTheory(theory.id);
      return {
        theory: {
          ...theory,
          author: theory.authorId ? findUser(theory.authorId) : null,
          parentTheory: theory.parentTheoryId
            ? findTheory(theory.parentTheoryId)
            : null,
        },
        objects,
        interpretationCount: interpretations.length,
      };
    }),

  getObject: publicProcedure
    .input(
      z.object({
        theorySlug: z.string(),
        objectSlug: z.string(),
        language: langSchema,
      }),
    )
    .query(({ input }) => {
      const theory = findTheoryBySlug(input.theorySlug, input.language);
      if (!theory) throw new TRPCError({ code: "NOT_FOUND" });
      const object = findTheoryObjectBySlug(theory.id, input.objectSlug);
      if (!object) throw new TRPCError({ code: "NOT_FOUND" });
      const citations = listCitationsForObject(object.id);
      return { theory, object, citations };
    }),
});
