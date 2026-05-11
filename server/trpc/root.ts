import { createCallerFactory, createTRPCRouter } from "./init";
import { authRouter } from "./routers/auth";
import { entityRouter } from "./routers/entity";
import { entityRelationRouter } from "./routers/entityRelation";
import { healthRouter } from "./routers/health";
import { interpretationRouter } from "./routers/interpretation";
import { theoryRouter } from "./routers/theory";
import { userRouter } from "./routers/user";
import { voteRouter } from "./routers/vote";

export const appRouter = createTRPCRouter({
  health: healthRouter,
  auth: authRouter,
  user: userRouter,
  entity: entityRouter,
  entityRelation: entityRelationRouter,
  theory: theoryRouter,
  interpretation: interpretationRouter,
  vote: voteRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
