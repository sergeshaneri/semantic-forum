import { createCallerFactory, createTRPCRouter } from "./init";
import { authRouter } from "./routers/auth";
import { entityRouter } from "./routers/entity";
import { healthRouter } from "./routers/health";
import { theoryRouter } from "./routers/theory";

export const appRouter = createTRPCRouter({
  health: healthRouter,
  auth: authRouter,
  entity: entityRouter,
  theory: theoryRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
