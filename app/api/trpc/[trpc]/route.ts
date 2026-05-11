import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";
import { createTRPCContext } from "@/server/trpc/init";
import { appRouter } from "@/server/trpc/root";

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
    onError({ path, error }) {
      if (process.env.NODE_ENV !== "production") {
        console.error(`tRPC error on ${path ?? "<unknown>"}:`, error);
      }
    },
  });

export { handler as GET, handler as POST };
