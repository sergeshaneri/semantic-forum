import "server-only";

import { headers } from "next/headers";
import { cache } from "react";
import { createTRPCContext } from "@/server/trpc/init";
import { createCaller } from "@/server/trpc/root";

const createContext = cache(async () => {
  const h = new Headers(await headers());
  h.set("x-trpc-source", "rsc");
  return createTRPCContext({ headers: h });
});

export const api = createCaller(createContext);
