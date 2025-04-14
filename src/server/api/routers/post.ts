// src/server/api/routers/publicPost.ts
import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { grows, images, plants, postImages, posts } from "~/lib/db/schema";
import {
  connectImageWithPlantsQuery,
  connectPlantWithImagesQuery,
} from "~/server/api/routers/plantImages";
import { protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { PostableEntityType } from "~/types/post";
import { postSchema } from "~/types/zodSchema";

export const postRouter = {
  create: protectedProcedure
    .input(postSchema)
    .mutation(async ({ ctx, input }) => {
      const { content, entityId, entityType, photoIds } = input;
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

      const post = newPost[0];

      // If photoIds are provided, associate them with the post
      if (photoIds && photoIds.length > 0) {
        // Validate that all photos exist and belong to the user
        const photoRecords = await ctx.db.query.images.findMany({
          where: (images, { and, eq, inArray }) =>
            and(eq(images.ownerId, userId), inArray(images.id, photoIds)),
        });

        if (photoRecords.length !== photoIds.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "One or more photos don't exist or don't belong to you",
          });
        }

        // Create associations in the postImages table
        await Promise.all(
          photoIds.map(async (photoId) => {
            await ctx.db
              .insert(postImages)
              .values({
                postId: post.id,
                imageId: photoId,
              })
              .onConflictDoNothing();
          }),
        );
      }

      return post;
    }),

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
        postImages: {
          with: {
            image: {
              columns: {
                id: true,
                imageUrl: true,
                originalFilename: true,
                captureDate: true,
              },
            },
          },
        },
      },
      orderBy: [desc(posts.createdAt)],
    });

    return allPosts;
  }),

  deleteById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // check if the post exists and the current user is the owner
      const post = await ctx.db.query.posts.findFirst({
        where: (posts, { eq }) => eq(posts.id, input.id),
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      if (post.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Session user does not own this post",
        });
      }

      // When deleting a post, the postImages join records will be automatically deleted
      // due to the ON DELETE CASCADE constraint
      const deletedPost = await ctx.db
        .delete(posts)
        .where(eq(posts.id, input.id));
      return { success: !!deletedPost };
    }),
};
