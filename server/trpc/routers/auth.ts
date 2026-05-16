import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { z } from "zod";
import { users } from "@/server/db/schema";
import { isEmailConfigured, sendWelcomeEmail } from "@/lib/email";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
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
  language: z.enum(["ru", "en"]).default("ru"),
});

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      // IP-based rate limit: 5 registrations per hour per IP.
      const ip = clientIpFromHeaders(ctx.headers);
      const r = rateLimit(`register:ip:${ip}`, {
        capacity: 5,
        windowMs: 60 * 60_000,
      });
      if (!r.ok) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message:
            "Слишком много попыток регистрации с этого IP. Попробуй позже.",
        });
      }

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
      const [inserted] = await ctx.db
        .insert(users)
        .values({
          email: input.email.toLowerCase(),
          username: input.username,
          name: input.name ?? input.username,
          passwordHash,
        })
        .returning({ id: users.id });

      // Best-effort welcome email — never block registration on delivery.
      if (isEmailConfigured()) {
        void sendWelcomeEmail({
          to: input.email.toLowerCase(),
          username: input.username,
          name: input.name,
          lang: input.language,
        }).then(async (sent) => {
          if (sent && inserted?.id) {
            await ctx.db
              .update(users)
              .set({ welcomeEmailSentAt: new Date() })
              .where(eq(users.id, inserted.id))
              .catch(() => {
                /* swallow */
              });
          }
        });
      }

      return { ok: true as const };
    }),
});
