// src/server/api/root.ts:


import { channelRouter } from "~/server/api/routers/channel";
import { chatRouter } from "~/server/api/routers/chat";
import { commentRouter } from "~/server/api/routers/comments";
import { growRouter } from "~/server/api/routers/grow";
import { photoRouter } from "~/server/api/routers/image";
import { likeRouter } from "~/server/api/routers/likes";
import { messageRouter } from "~/server/api/routers/message";
import { plantRouter } from "~/server/api/routers/plant";
import { postRouter } from "~/server/api/routers/post";
import { userRouter } from "~/server/api/routers/users";
import { notificationRouter } from "~/server/api/routers/notifications";
import { adminRouter } from "~/server/api/routers/admin";
import { createTRPCRouter, publicProcedure } from "~/lib/trpc/init";

import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

/**
 * This is the primary router for the server.
 *
 * All routers added in /server/api/routers must be added here.
 */
export const appRouter = createTRPCRouter({
  users: userRouter,
  grows: growRouter,
  plants: plantRouter,
  photos: photoRouter,
  likes: likeRouter,
  comments: commentRouter,
  posts: postRouter,
  chat: chatRouter,
  channel: channelRouter,
  message: messageRouter,
  notifications: notificationRouter,
  admin: adminRouter,

  healthcheck: publicProcedure.query(() => "yay!"),

  randomNumber: publicProcedure.subscription(async function* () {
    while (true) {
      yield Math.random();
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
Inference helper for inputs.
@example type HelloInput = RouterInputs['example']['hello']
*/
type RouterInput = inferRouterInputs<AppRouter>;

/**
Inference helper for outputs.
@example type HelloOutput = RouterOutputs['example']['hello']
*/
type RouterOutput = inferRouterOutputs<AppRouter>;

// notificationRouter
//  OUTPUTS:
export type GetAllNotificationsResponse = RouterOutput["notifications"]["getAll"];
export type GetAllNotificationsType = RouterOutput["notifications"]["getAll"]["items"];
export type GetAllNotificationType = RouterOutput["notifications"]["getAll"]["items"][number];

//  INPUTS:
export type GetAllNotificationsInput = RouterInput["notifications"]["getAll"];

// postRouter
//  OUTPUTS:
export type GetPostsType = RouterOutput["posts"]["getAll"];
export type GetPostType = RouterOutput["posts"]["getAll"][number];
export type GetCreatePostOutput = RouterOutput["posts"]["create"];

//  INPUTS:
export type GetPostsInput = RouterInput["posts"]["getAll"];
export type CreatePostInput = RouterInput["posts"]["create"];

// userRouter
//  OUTPUTS:
export type GetOwnUserDataType = RouterOutput["users"]["getOwnUserData"];
export type OwnUserDataType = NonNullable<GetOwnUserDataType>;
export type GetPublicUserProfileType = RouterOutput["users"]["getPublicUserProfile"];
export type PublicUserProfileType = NonNullable<GetPublicUserProfileType>;

//  INPUTS
export type GetUserByIdInput = RouterInput["users"]["getOwnUserData"];
export type EditUserInput = RouterInput["users"]["editUser"];
export type RegisterUserInput = RouterInput["users"]["registerUser"];
export type GetPublicUserProfileInput = RouterInput["users"]["getPublicUserProfile"];

// commentRouter
//  OUTPUTS:
export type GetCommentsType = RouterOutput["comments"]["getComments"];
export type GetCommentType = RouterOutput["comments"]["getComments"][number];
// export type GetRepliesType = RouterOutput["comments"]["getReplies"];
// export type GetReplyType = RouterOutput["comments"]["getReplies"][number];
// export type GetCommentCountType = RouterOutput["comments"]["getCommentCount"];
// export type DeleteCommentOutput = RouterOutput["comments"]["deleteById"];
// INPUTS:
export type GetCommentsInput = RouterInput["comments"]["getComments"];
// export type GetCommentCountInput = RouterInput["comments"]["getCommentCount"];
export type GetRepliesInput = RouterInput["comments"]["getReplies"];
// export type DeleteCommentInput = RouterInput["comments"]["deleteById"];

// likeRouter
//  OUTPUTS:
// export type ToggleLikeOutput = RouterOutput["likes"]["toggleLike"];
// export type GetLikeCountOutput = RouterOutput["likes"]["getLikeCount"];
// export type GetUserLikedEntitiesType = RouterOutput["likes"]["getUserLikedEntities"];
// export type GetUserLikedEntityType = RouterOutput["likes"]["getUserLikedEntities"][number];
//  INPUTS:
export type ToggleLikeInput = RouterInput["likes"]["toggleLike"];
// export type GetLikeCountInput = RouterInput["likes"]["getLikeCount"];
// export type GetUserLikedEntitiesInput = RouterInput["likes"]["getUserLikedEntities"];

// photoRouter
//  OUTPUTS:
// export type GetOwnPhotosOutput = RouterOutput["photos"]["getOwnPhotos"];
export type GetOwnPhotosType = RouterOutput["photos"]["getOwnPhotos"]["images"];
export type GetOwnPhotoType = RouterOutput["photos"]["getOwnPhotos"]["images"][number];
export type GetPhotoByIdType = RouterOutput["photos"]["getById"];
// export type CreatePhotoOutput = RouterOutput["photos"]["createPhoto"];
//  INPUTS:
export type GetOwnPhotosInput = RouterInput["photos"]["getOwnPhotos"];
export type GetPhotoByIdInput = RouterInput["photos"]["getById"];
export type CreatePhotoInput = RouterInput["photos"]["createPhoto"];

// plantRouter
//  OUTPUTS:
// export type GetOwnPlantsOutput = RouterOutput["plants"]["getOwnPlants"];
export type GetOwnPlantsType = RouterOutput["plants"]["getOwnPlants"]["plants"];
export type GetOwnPlantType = RouterOutput["plants"]["getOwnPlants"]["plants"][number];
export type GetPlantByIdType = RouterOutput["plants"]["getById"];
// export type GetAllPlantsOutput = RouterOutput["plants"]["getAllPlants"];
export type GetAllPlantsType = RouterOutput["plants"]["getAllPlants"]["plants"];
export type GetAllPlantType = RouterOutput["plants"]["getAllPlants"]["plants"][number];

// export type ExplorePlantsOutput = RouterOutput["plants"]["explore"];
// export type ExplorePlantsType = RouterOutput["plants"]["explore"]["plants"];
// export type ExplorePlantType = RouterOutput["plants"]["explore"]["plants"][number];

export type PlantByIdType = NonNullable<GetPlantByIdType>;
export type PlantImagesType = NonNullable<GetPlantByIdType>["plantImages"];


// Option 1: Extract the grow type and make it non-nullable
export type PlantGrowType = NonNullable<NonNullable<PlantByIdType>["grow"]>;


export type ImageType = NonNullable<GetPlantByIdType>["plantImages"][number]["image"];
//  INPUTS:
export type GetOwnPlantsInput = RouterInput["plants"]["getOwnPlants"];
export type GetPlantByIdInput = RouterInput["plants"]["getById"];
export type CreateOrEditPlantInput = RouterInput["plants"]["createOrEdit"];
export type GetAllPlantsInput = RouterInput["plants"]["getAllPlants"];
// export type ExplorePlantsInput = RouterInput["plants"]["explore"];
export type GetConnectablePlantsInput = RouterInput["plants"]["getConnectablePlants"];

// growRouter
//  OUTPUTS:
export type GetGrowByIdType = RouterOutput["grows"]["getById"];
// export type GetOwnGrowsOutput = RouterOutput["grows"]["getOwnGrows"];
export type GetOwnGrowsType = RouterOutput["grows"]["getOwnGrows"]["grows"];
export type GetOwnGrowType = RouterOutput["grows"]["getOwnGrows"]["grows"][number];

// export type GetAllGrowsOutput = RouterOutput["grows"]["getAllGrows"];
export type GetAllGrowsType = RouterOutput["grows"]["getAllGrows"]["grows"];
export type GetAllGrowType = RouterOutput["grows"]["getAllGrows"]["grows"][number];

// export type ExploreGrowsOutput = RouterOutput["grows"]["explore"];
// export type ExploreGrowsType = RouterOutput["grows"]["explore"]["grows"];
// export type ExploreGrowType = RouterOutput["grows"]["explore"]["grows"][number];

//  INPUTS:
export type GetGrowByIdInput = RouterInput["grows"]["getById"];
export type GetOwnGrowsInput = RouterInput["grows"]["getOwnGrows"];
export type GetAllGrowsInput = RouterInput["grows"]["getAllGrows"];
export type ExploreGrowsInput = RouterInput["grows"]["explore"];
export type CreateOrEditGrowInput = RouterInput["grows"]["createOrEdit"];
export type GrowConnectPlantInput = RouterInput["grows"]["connectPlant"];
export type GrowDisconnectPlantInput = RouterInput["grows"]["disconnectPlant"];

// breedersRouter
//  OUTPUTS:
// export type GetBreedersType = RouterOutput["plants"]["getBreeders"];
// export type BreederType = RouterOutput["plants"]["getBreeders"][number];
// export type CreateBreederOutput = RouterOutput["plants"]["createBreeder"];

// INPUTS:
// export type CreateBreederInput = RouterInput["plants"]["createBreeder"];

// strainsRouter
//  OUTPUTS:
// export type GetStrainsByBreederType = RouterOutput["plants"]["getStrainsByBreeder"];

// export type GetStrainByIdType = RouterOutput["plants"]["getStrainById"];
export type StrainType = NonNullable<RouterOutput["plants"]["getStrainById"]>;
// export type CreateStrainOutput = RouterOutput["plants"]["createStrain"];

//  INPUTS:
// export type GetStrainsByBreederInput = RouterInput["plants"]["getStrainsByBreeder"];
// export type CreateStrainInput = RouterInput["plants"]["createStrain"];
// export type GetStrainByIdInput = RouterInput["plants"]["getStrainById"];

// adminRouter
//  OUTPUTS:
export type AdminUserListItem = RouterOutput["admin"]["getAllUsers"][number];
// export type AdminUserList = RouterOutput["admin"]["getAllUsers"];
// export type AdminUpdateUserRoleOutput = RouterOutput["admin"]["updateUserRole"];

//  INPUTS:
// export type AdminUpdateUserRoleInput = RouterInput["admin"]["updateUserRole"];
// export type AdminBanUserInput = RouterInput["admin"]["banUser"];
// export type AdminUnbanUserInput = RouterInput["admin"]["unbanUser"];
// export type AdminGetAllUsersInput = RouterInput["admin"]["getAllUsers"];
export type AdminGetUserByIdInput = RouterInput["admin"]["getUserById"];
