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
       type GetOwnImagesOutput = RouterOutput["image"]["getOwnImages"];
export type GetOwnImagesInput = inferRouterInputs<AppRouter>["image"]["getOwnImages"];

export type ImageWithPlants = GetOwnImagesOutput["images"][number];
export type ImageWithPlantsById = RouterOutput["image"]["getById"];

export type CreateImageInput = inferRouterInputs<AppRouter>["image"]["createImage"];

// plantRouter
       type GetOwnPlantsOutput = RouterOutput["plant"]["getOwnPlants"];
export type GetOwnPlantsInput = inferRouterInputs<AppRouter>["plant"]["getOwnPlants"];

export type PlantWithImages = GetOwnPlantsOutput["plants"][number];
export type PlantWithImagesById = RouterOutput["plant"]["getById"];

export type CreatePlantInput = inferRouterInputs<AppRouter>["plant"]["createOrEdit"];

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
