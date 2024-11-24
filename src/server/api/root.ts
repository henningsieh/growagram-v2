// src/server/api/root.ts:
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { imageRouter } from "~/server/api/routers/image";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

import { plantRouter } from "./routers/plant";


/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  image: imageRouter,
  plant: plantRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
type RouterOutput = inferRouterOutputs<AppRouter>;
type RouterInput = inferRouterInputs<AppRouter>

// imageRouter
//  OUTPUTS
export type GetOwnImagesOutput = RouterOutput["image"]["getOwnImages"]["images"];
export type GetOwnImageOutput = RouterOutput["image"]["getOwnImages"]["images"][number];
export type GetImageByIdOutput = RouterOutput["image"]["getById"];
//  INPUTS:
export type GetOwnImagesInput = RouterInput["image"]["getOwnImages"];
export type CreateImageInput = RouterInput["image"]["createImage"];


// plantRouter
//  OUTPUTS
export type GetOwnPlantsOutput = RouterOutput["plant"]["getOwnPlants"]["plants"];
export type GetOwnPlantOutput = RouterOutput["plant"]["getOwnPlants"]["plants"][number];
export type GetPlantByIdOutput = RouterOutput["plant"]["getById"];
//  INPUTS:
export type GetOwnPlantsInput = RouterInput["plant"]["getOwnPlants"];
export type CreateOrEditPlantInput = RouterInput["plant"]["createOrEdit"];

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
