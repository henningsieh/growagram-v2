// src/server/api/root.ts:
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { photoRouter } from "~/server/api/routers/image";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

import { plantRouter } from "./routers/plant";
import { growRouter } from "./routers/grow";
import { likeRouter } from "./routers/likes";
import { commentRouter } from "./routers/comments";
import { userRouter } from "./routers/users";


/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  photos: photoRouter,
  plants: plantRouter,
  grows: growRouter,
  likes: likeRouter,
  users: userRouter,
  comments: commentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
type RouterOutput = inferRouterOutputs<AppRouter>;
type RouterInput = inferRouterInputs<AppRouter>

// userRouter
//  OUTPUTS:
// export type UserType = NonNullable<GetUserType>;
export type GetUserType = RouterOutput["users"]["getById"]
export type GetUserEditType = RouterOutput["users"]["getAllUsers"][number]
export type GetUserPublicType = RouterOutput["users"]["getAllUsers"][number]
export type GetUsersPublicType = RouterOutput["users"]["getAllUsers"]
//  INPUTS
export type GetUserByIdInput = RouterInput["users"]["getById"]
export type GetUserEditInput = RouterInput["users"]["editUser"]

// commentRouter
//  OUTPUTS:
export type GetCommentsType = RouterOutput["comments"]["getComments"]
export type GetCommentType = RouterOutput["comments"]["getComments"][number]
export type GetRepliesType = RouterOutput["comments"]["getReplies"]
export type GetReplyType = RouterOutput["comments"]["getReplies"][number]
export type GetCommentCountType = RouterOutput["comments"]["getCommentCount"]
export type DeleteCommentOutput = RouterOutput["comments"]["deleteById"]
// INPUTS:
export type GetCommentsInput = RouterInput["comments"]["getComments"]
export type GetCommentCountInput = RouterInput["comments"]["getCommentCount"]
export type GetRepliesInput = RouterInput["comments"]["getReplies"]
export type DeleteCommentInput = RouterInput["comments"]["deleteById"]



// likeRouter
//  OUTPUTS:
export type ToggleLikeOutput = RouterOutput["likes"]["toggleLike"]
export type GetLikeCountOutput = RouterOutput["likes"]["getLikeCount"]
export type GetUserLikedEntitiesType = RouterOutput["likes"]["getUserLikedEntities"]
export type GetUserLikedEntityType = RouterOutput["likes"]["getUserLikedEntities"][number]
//  INPUTS:
export type ToggleLikeInput = RouterInput["likes"]["toggleLike"]
export type GetLikeCountInput = RouterInput["likes"]["getLikeCount"]
export type GetUserLikedEntitiesInput = RouterInput["likes"]["getUserLikedEntities"]

// imageRouter
//  OUTPUTS:
export type GetOwnPhotosOutput = RouterOutput["photos"]["getOwnPhotos"];
export type GetOwnPhotosType = RouterOutput["photos"]["getOwnPhotos"]["images"];
export type GetOwnPhotoType = RouterOutput["photos"]["getOwnPhotos"]["images"][number];
export type GetPhotoByIdType = RouterOutput["photos"]["getById"];
//  INPUTS:
export type GetOwnPhotosInput = RouterInput["photos"]["getOwnPhotos"];
export type GetPhotoByIdInput = RouterInput["photos"]["getById"];
export type CreatePhotoInput = RouterInput["photos"]["createPhoto"];


// plantRouter
//  OUTPUTS:
export type GetOwnPlantsOutput = RouterOutput["plants"]["getOwnPlants"];
export type GetOwnPlantsType = RouterOutput["plants"]["getOwnPlants"]["plants"];
export type GetOwnPlantType = RouterOutput["plants"]["getOwnPlants"]["plants"][number];
export type GetPlantByIdType = RouterOutput["plants"]["getById"];
//  INPUTS:
export type GetOwnPlantsInput = RouterInput["plants"]["getOwnPlants"];
export type GetPlantByIdInput = RouterInput["plants"]["getById"];
export type CreateOrEditPlantInput = RouterInput["plants"]["createOrEdit"];

// growRouter
//  OUTPUTS:
export type GetOwnGrowsOutput = RouterOutput["grows"]["getOwnGrows"];
export type GetOwnGrowsType = RouterOutput["grows"]["getOwnGrows"]["grows"];
export type GetOwnGrowType = RouterOutput["grows"]["getOwnGrows"]["grows"][number];
export type GetGrowByIdType = RouterOutput["grows"]["getById"];
//  INPUTS:
export type GetOwnGrowsInput = RouterInput["grows"]["getOwnGrows"];
export type GetGrowByIdInput = RouterInput["grows"]["getById"];
export type CreateOrEditGrowInput = RouterInput["grows"]["createOrEdit"];
export type GrowConnectPlantInput = RouterInput["grows"]["connectPlant"];
export type GrowDisconnectPlantInput = RouterInput["grows"]["disconnectPlant"];

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
