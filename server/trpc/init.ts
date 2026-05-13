import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth } from "@/lib/auth/auth";
import { hasWriteScope, verifyApiKey, type VerifiedApiKey } from "@/lib/api-key";
import { db } from "@/server/db";

export async function createTRPCContext(opts: { headers: Headers }) {
  const session = await auth();

  // Bearer token fallback — used by CLIs and AI agents.
  // Only honored when there's no browser session, so a stolen cookie
  // can't be combined with a key escalation.
  let apiKey: VerifiedApiKey | null = null;
  if (!session?.user?.id) {
    const authHeader = opts.headers.get("authorization");
    if (authHeader?.toLowerCase().startsWith("bearer ")) {
      const raw = authHeader.slice(7).trim();
      apiKey = await verifyApiKey(raw);
    }
  }

  return {
    db,
    session,
    apiKey,
    headers: opts.headers,
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

/**
 * Standard protected procedure.
 * Accepts EITHER a session (browser) OR a Bearer API key.
 * For API-key mutations, requires at least one `write:*` or `*` scope.
 */
export const protectedProcedure = t.procedure.use(({ ctx, type, next }) => {
  const sessionUserId = ctx.session?.user?.id ?? null;
  const apiKeyUserId = ctx.apiKey?.userId ?? null;
  const userId = sessionUserId ?? apiKeyUserId;
  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (type === "mutation" && ctx.apiKey) {
    if (!hasWriteScope(ctx.apiKey.scopes)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "API-ключ без write-скоупа не может выполнять мутации",
      });
    }
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      userId,
    },
  });
});

/**
 * Stricter procedure for sensitive operations that must NOT be callable
 * via an API key (managing API keys themselves, account-level settings, etc.).
 * Requires a real browser session.
 */
export const sessionOnlyProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message:
        "Эту операцию можно выполнить только из браузера, не через API-ключ",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      userId: ctx.session.user.id,
    },
  });
});
