import { createCallerFactory, createTRPCRouter } from "./init";
import { affiliationRouter } from "./routers/affiliation";
import { authRouter } from "./routers/auth";
import { bookmarkRouter } from "./routers/bookmark";
import { collectionRouter } from "./routers/collection";
import { commentRouter } from "./routers/comment";
import { dmRouter } from "./routers/dm";
import { entityRouter } from "./routers/entity";
import { entityRelationRouter } from "./routers/entityRelation";
import { eventRouter } from "./routers/event";
import { groupRouter } from "./routers/group";
import { healthRouter } from "./routers/health";
import { interpretationRouter } from "./routers/interpretation";
import { leaderboardRouter } from "./routers/leaderboard";
import { notificationRouter } from "./routers/notification";
import { pollRouter } from "./routers/poll";
import { productRouter } from "./routers/product";
import { publicationRouter } from "./routers/publication";
import { answerRouter, questionRouter } from "./routers/question";
import { schoolRouter, sourceRouter } from "./routers/school";
import { searchRouter } from "./routers/search";
import { statsRouter } from "./routers/stats";
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
  leaderboard: leaderboardRouter,
  collection: collectionRouter,
  question: questionRouter,
  answer: answerRouter,
  event: eventRouter,
  stats: statsRouter,
  dm: dmRouter,
  poll: pollRouter,
  group: groupRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
