// src/server/api/routers/publicPost.ts
import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { grows, images, plants, posts, userFollows } from "~/lib/db/schema";
import { protectedProcedure, publicProcedure } from "~/lib/trpc/init";
import {
  connectImageWithPlantsQuery,
  connectPlantWithImagesQuery,
} from "~/server/api/routers/plantImages";
import { PostableEntityType } from "~/types/post";
import { postSchema, timelinePaginationSchema } from "~/types/zodSchema";

export const postRouter = {
  create: protectedProcedure
    .input(postSchema)
    .mutation(async ({ ctx, input }) => {
      const { content, entityId, entityType } = input;
      const userId = ctx.session.user.id;

      // Validate entity exists
      let entityExists = false;
      if (entityType === PostableEntityType.GROW) {
        const grow = await ctx.db.query.grows.findFirst({
          where: eq(grows.id, entityId),
        });
        entityExists = !!grow;
      } else if (entityType === PostableEntityType.PLANT) {
        const plant = await ctx.db.query.plants.findFirst({
          where: eq(plants.id, entityId),
        });
        entityExists = !!plant;
      } else if (entityType === PostableEntityType.PHOTO) {
        const image = await ctx.db.query.images.findFirst({
          where: eq(images.id, entityId),
        });
        entityExists = !!image;
      }

      if (!entityExists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `${entityType} with id ${entityId} not found`,
        });
      }

      // Insert new post
      const newPost = await ctx.db
        .insert(posts)
        .values({
          userId,
          content,
          entityId,
          entityType,
        })
        .returning();

      return newPost[0];
    }),

  // Legacy endpoint - deprecated, use getPublicTimeline instead
  getAll: publicProcedure.query(async ({ ctx }) => {
    const allPosts = await ctx.db.query.posts.findMany({
      with: {
        owner: true,
        grow: {
          with: {
            owner: true,
            headerImage: true,
            plants: {
              with: {
                owner: true,
                grow: true,
                strain: {
                  columns: {
                    id: true,
                    name: true,
                    thcContent: true,
                    cbdContent: true,
                  },
                  with: { breeder: { columns: { id: true, name: true } } },
                },
                headerImage: { columns: { id: true, imageUrl: true } },
                plantImages: connectPlantWithImagesQuery,
              },
            },
          },
        },
        plant: {
          with: {
            owner: true,
            grow: true,
            plantImages: connectPlantWithImagesQuery,
            strain: {
              columns: {
                id: true,
                name: true,
                thcContent: true,
                cbdContent: true,
              },
              with: { breeder: { columns: { id: true, name: true } } },
            },
            headerImage: { columns: { id: true, imageUrl: true } },
          },
        },
        photo: {
          with: {
            owner: true,
            plantImages: connectImageWithPlantsQuery,
          },
          columns: {
            id: true,
            createdAt: true,
            updatedAt: true,
            ownerId: true,
            imageUrl: true,
            cloudinaryAssetId: true,
            cloudinaryPublicId: true,
            captureDate: true,
            originalFilename: true,
          },
        },
      },
      orderBy: [desc(posts.createdAt)],
    });

    return allPosts;
  }),

  getPublicTimeline: publicProcedure
    .input(timelinePaginationSchema)
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;

      // Get all public posts with cursor-based pagination
      const timelinePosts = await ctx.db.query.posts.findMany({
        where: cursor
          ? (postsTable, { lt }) => lt(postsTable.createdAt, new Date(cursor))
          : undefined,
        orderBy: (postsTable, { desc }) => [desc(postsTable.createdAt)],
        limit: limit + 1, // Get one extra to determine if there's a next page
        with: {
          owner: true,
          grow: {
            with: {
              owner: true,
              headerImage: true,
              plants: {
                with: {
                  owner: true,
                  grow: true,
                  strain: {
                    columns: {
                      id: true,
                      name: true,
                      thcContent: true,
                      cbdContent: true,
                    },
                    with: { breeder: { columns: { id: true, name: true } } },
                  },
                  headerImage: { columns: { id: true, imageUrl: true } },
                  plantImages: connectPlantWithImagesQuery,
                },
              },
            },
          },
          plant: {
            with: {
              owner: true,
              grow: true,
              plantImages: connectPlantWithImagesQuery,
              strain: {
                columns: {
                  id: true,
                  name: true,
                  thcContent: true,
                  cbdContent: true,
                },
                with: { breeder: { columns: { id: true, name: true } } },
              },
              headerImage: { columns: { id: true, imageUrl: true } },
            },
          },
          photo: {
            with: {
              owner: true,
              plantImages: connectImageWithPlantsQuery,
            },
            columns: {
              id: true,
              createdAt: true,
              updatedAt: true,
              ownerId: true,
              imageUrl: true,
              cloudinaryAssetId: true,
              cloudinaryPublicId: true,
              captureDate: true,
              originalFilename: true,
            },
          },
        },
      });

      // Determine if there's a next page and prepare the cursor
      const hasNextPage = timelinePosts.length > limit;
      const postsToReturn = hasNextPage
        ? timelinePosts.slice(0, limit)
        : timelinePosts;
      const nextCursor = hasNextPage
        ? postsToReturn[postsToReturn.length - 1]?.createdAt.toISOString()
        : null;

      return {
        posts: postsToReturn,
        nextCursor,
      };
    }),

  getFollowingTimeline: protectedProcedure
    .input(timelinePaginationSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { cursor, limit } = input;

      // First, get the IDs of users that the current user follows
      const followingUsers = await ctx.db.query.userFollows.findMany({
        where: eq(userFollows.followerId, userId),
        columns: {
          followingId: true,
        },
      });

      // Extract just the user IDs
      const followingUserIds = followingUsers.map((f) => f.followingId);

      // If user doesn't follow anyone, return empty results
      if (followingUserIds.length === 0) {
        return {
          posts: [],
          nextCursor: null,
        };
      }

      // Get posts from followed users with cursor-based pagination
      const timelinePosts = await ctx.db.query.posts.findMany({
        where: (postsTable, { and, inArray, lt }) => {
          const conditions = [inArray(postsTable.userId, followingUserIds)];

          // Add cursor condition if provided (for pagination)
          if (cursor) {
            conditions.push(lt(postsTable.createdAt, new Date(cursor)));
          }

          return and(...conditions);
        },
        orderBy: (postsTable, { desc }) => [desc(postsTable.createdAt)],
        limit: limit + 1, // Get one extra to determine if there's a next page
        with: {
          owner: true,
          grow: {
            with: {
              owner: true,
              headerImage: true,
              plants: {
                with: {
                  owner: true,
                  grow: true,
                  strain: {
                    columns: {
                      id: true,
                      name: true,
                      thcContent: true,
                      cbdContent: true,
                    },
                    with: { breeder: { columns: { id: true, name: true } } },
                  },
                  headerImage: { columns: { id: true, imageUrl: true } },
                  plantImages: connectPlantWithImagesQuery,
                },
              },
            },
          },
          plant: {
            with: {
              owner: true,
              grow: true,
              plantImages: connectPlantWithImagesQuery,
              strain: {
                columns: {
                  id: true,
                  name: true,
                  thcContent: true,
                  cbdContent: true,
                },
                with: { breeder: { columns: { id: true, name: true } } },
              },
              headerImage: { columns: { id: true, imageUrl: true } },
            },
          },
          photo: {
            with: {
              owner: true,
              plantImages: connectImageWithPlantsQuery,
            },
            columns: {
              id: true,
              createdAt: true,
              updatedAt: true,
              ownerId: true,
              imageUrl: true,
              cloudinaryAssetId: true,
              cloudinaryPublicId: true,
              captureDate: true,
              originalFilename: true,
            },
          },
        },
      });

      // Determine if there's a next page and prepare the cursor
      const hasNextPage = timelinePosts.length > limit;
      const postsToReturn = hasNextPage
        ? timelinePosts.slice(0, limit)
        : timelinePosts;
      const nextCursor = hasNextPage
        ? postsToReturn[postsToReturn.length - 1]?.createdAt.toISOString()
        : null;

      return {
        posts: postsToReturn,
        nextCursor,
      };
    }),

  deleteById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // check if the plant exists and the current user is the owner
      const post = await ctx.db.query.posts.findFirst({
        where: (plants, { eq }) => eq(plants.id, input.id),
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Plant not found",
        });
      }

      if (post.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Session user does not own this plant",
        });
      }

      // Logic to delete an post by ID
      const deletedPost = await ctx.db
        .delete(posts)
        .where(eq(posts.id, input.id));
      return { success: !!deletedPost };
    }),
};
