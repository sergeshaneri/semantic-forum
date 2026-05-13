import { createCallerFactory, createTRPCRouter } from "./init";
import { affiliationRouter } from "./routers/affiliation";
import { authRouter } from "./routers/auth";
import { bookmarkRouter } from "./routers/bookmark";
import { commentRouter } from "./routers/comment";
import { entityRouter } from "./routers/entity";
import { entityRelationRouter } from "./routers/entityRelation";
import { healthRouter } from "./routers/health";
import { interpretationRouter } from "./routers/interpretation";
import { notificationRouter } from "./routers/notification";
import { productRouter } from "./routers/product";
import { publicationRouter } from "./routers/publication";
import { schoolRouter, sourceRouter } from "./routers/school";
import { searchRouter } from "./routers/search";
import { theoryRouter } from "./routers/theory";
import { theoryObjectRouter } from "./routers/theoryObject";
import { trendingRouter } from "./routers/trending";
import { userLinkRouter } from "./routers/userLink";
import { userRouter } from "./routers/user";
import { voteRouter } from "./routers/vote";

export const appRouter = createTRPCRouter({
  health: healthRouter,
  auth: authRouter,
  user: userRouter,
  userLink: userLinkRouter,
  affiliation: affiliationRouter,
  entity: entityRouter,
  entityRelation: entityRelationRouter,
  theory: theoryRouter,
  theoryObject: theoryObjectRouter,
  interpretation: interpretationRouter,
  comment: commentRouter,
  publication: publicationRouter,
  product: productRouter,
  vote: voteRouter,
  notification: notificationRouter,
  bookmark: bookmarkRouter,
  search: searchRouter,
  school: schoolRouter,
  source: sourceRouter,
  trending: trendingRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
