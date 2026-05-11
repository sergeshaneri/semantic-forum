import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { z } from "zod";
import { users } from "@/server/db/schema";
import { createTRPCRouter, publicProcedure } from "../init";

const registerSchema = z.object({
  email: z.email("Некорректный email"),
  username: z
    .string()
    .min(3, "Минимум 3 символа")
    .max(32, "Максимум 32 символа")
    .regex(/^[a-zA-Z0-9_]+$/, "Только латиница, цифры и _"),
  password: z.string().min(8, "Минимум 8 символов").max(128),
  name: z.string().min(1).max(128).optional(),
});

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db
        .select({
          id: users.id,
          email: users.email,
          username: users.username,
        })
        .from(users)
        .where(
          or(
            eq(users.email, input.email.toLowerCase()),
            eq(users.username, input.username),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        const conflict = existing[0]!;
        if (conflict.email === input.email.toLowerCase()) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Этот email уже зарегистрирован",
          });
        }
        throw new TRPCError({
          code: "CONFLICT",
          message: "Этот username уже занят",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, 10);
      await ctx.db.insert(users).values({
        email: input.email.toLowerCase(),
        username: input.username,
        name: input.name ?? input.username,
        passwordHash,
      });

      return { ok: true as const };
    }),
});
