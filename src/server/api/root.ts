// src/server/api/root.ts:
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { imageRouter } from "~/server/api/routers/image";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

import { plantRouter } from "./routers/plant";
import { growRouter } from "./routers/grow";


/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  image: imageRouter,
  plant: plantRouter,
  grow: growRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
type RouterOutput = inferRouterOutputs<AppRouter>;
type RouterInput = inferRouterInputs<AppRouter>

// imageRouter
//  OUTPUTS
export type GetOwnImagesOutput = RouterOutput["image"]["getOwnImages"];
export type GetOwnImagesType = RouterOutput["image"]["getOwnImages"]["images"];
export type GetOwnImageType = RouterOutput["image"]["getOwnImages"]["images"][number];
export type GetImageByIdType = RouterOutput["image"]["getById"];
//  INPUTS:
export type GetOwnImagesInput = RouterInput["image"]["getOwnImages"];
export type GetImageByIdInput = RouterInput["image"]["getById"];
export type CreateImageInput = RouterInput["image"]["createImage"];


// plantRouter
//  OUTPUTS
export type GetOwnPlantsOutput = RouterOutput["plant"]["getOwnPlants"];
export type GetOwnPlantsType = RouterOutput["plant"]["getOwnPlants"]["plants"];
export type GetOwnPlantType = RouterOutput["plant"]["getOwnPlants"]["plants"][number];
export type GetPlantByIdType = RouterOutput["plant"]["getById"];
//  INPUTS:
export type GetOwnPlantsInput = RouterInput["plant"]["getOwnPlants"];
export type GetPlantByIdInput = RouterInput["plant"]["getById"];
export type CreateOrEditPlantInput = RouterInput["plant"]["createOrEdit"];

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
