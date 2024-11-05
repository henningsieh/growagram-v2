// src/server/api/root.ts:
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { imageRouter } from "~/server/api/routers/image";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

import { plantRouter } from "./routers/plant";

// export type definition of API
export type AppRouter = typeof appRouter;
type RouterOutput = inferRouterOutputs<AppRouter>;

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  image: imageRouter,
  plant: plantRouter,
});

// imageRouter
export type GetUserImagesInput =
  inferRouterInputs<AppRouter>["image"]["getUserImages"];
export type GetUserImagesOutput = RouterOutput["image"]["getUserImages"];
export type UserImage = GetUserImagesOutput["images"][number];

// plantRouter
export type GetUserPlantsInput =
  inferRouterInputs<AppRouter>["plant"]["getUserPlants"];
export type GetUserPlantsOutput = RouterOutput["plant"]["getUserPlants"];
export type UserPlant = GetUserPlantsOutput["plants"][number];

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
