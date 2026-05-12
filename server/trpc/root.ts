import { createCallerFactory, createTRPCRouter } from "./init";
import { authRouter } from "./routers/auth";
import { commentRouter } from "./routers/comment";
import { entityRouter } from "./routers/entity";
import { entityRelationRouter } from "./routers/entityRelation";
import { healthRouter } from "./routers/health";
import { interpretationRouter } from "./routers/interpretation";
import { productRouter } from "./routers/product";
import { publicationRouter } from "./routers/publication";
import { theoryRouter } from "./routers/theory";
import { theoryObjectRouter } from "./routers/theoryObject";
import { userLinkRouter } from "./routers/userLink";
import { userRouter } from "./routers/user";
import { voteRouter } from "./routers/vote";

export const appRouter = createTRPCRouter({
  health: healthRouter,
  auth: authRouter,
  user: userRouter,
  userLink: userLinkRouter,
  entity: entityRouter,
  entityRelation: entityRelationRouter,
  theory: theoryRouter,
  theoryObject: theoryObjectRouter,
  interpretation: interpretationRouter,
  comment: commentRouter,
  publication: publicationRouter,
  product: productRouter,
  vote: voteRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
