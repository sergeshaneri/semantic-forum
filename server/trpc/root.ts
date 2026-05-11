import { createCallerFactory, createTRPCRouter } from "./init";
import { entityRouter } from "./routers/entity";
import { healthRouter } from "./routers/health";
import { theoryRouter } from "./routers/theory";

export const appRouter = createTRPCRouter({
  health: healthRouter,
  entity: entityRouter,
  theory: theoryRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
