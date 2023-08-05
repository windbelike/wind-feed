import { exampleRouter } from "~/server/api/routers/example";
import { createTRPCRouter } from "~/server/api/trpc";
import { threadRouter } from "./routers/thread";
import { profileRouter } from "./routers/profileRouter";
import { notificationRouter } from "./routers/notification";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  thread: threadRouter,
  profile: profileRouter,
  notification: notificationRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
