// src/server/api/routers/publicPost.ts
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { grows, images, plants, posts } from "~/lib/db/schema";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { PostableEntityType } from "~/types/post";
import { postSchema } from "~/types/zodSchema";

import { connectPlantWithImagesQuery } from "./plantImages";

export const postRouter = createTRPCRouter({
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

  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.query.posts.findMany({
      with: {
        owner: true,
        grow: {
          with: {
            owner: true,
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
        photo: true,
      },
    });

    return posts;
  }),
});
