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
       type GetUserImagesOutput = RouterOutput["image"]["getOwnImages"];
export type GetUserImagesInput = inferRouterInputs<AppRouter>["image"]["getOwnImages"];
export type UserImage = GetUserImagesOutput["images"][number];
export type ImageById = RouterOutput["image"]["getById"];

export type CreateImageInput = inferRouterInputs<AppRouter>["image"]["createImage"];

// plantRouter
export type GetOwnPlantsInput =
  inferRouterInputs<AppRouter>["plant"]["getOwnPlants"];
export type GetOwnPlantsOutput = RouterOutput["plant"]["getOwnPlants"];
export type OwnPlant = GetOwnPlantsOutput["plants"][number];

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
