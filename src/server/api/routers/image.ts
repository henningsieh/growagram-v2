// src/server/api/routers/image.ts:
import { eq } from "drizzle-orm";
import { z } from "zod";
import { images, plantImages } from "~/lib/db/schema";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const imageRouter = createTRPCRouter({
  getOwnImages: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(9),
        cursor: z.number().nullish(), // Cursor-based pagination
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string; // Access the user ID from session

      // Query the database for images owned by the user, ordered by creation date
      const imagesList = await ctx.db.query.images.findMany({
        where: eq(images.ownerId, userId),
        orderBy: (images, { desc }) => [desc(images.createdAt)],
        limit: input.limit + 1, // Fetch one extra item to check if there's a next page
        offset: input.cursor ?? 0,
      });

      // Check if there is a next page
      let nextCursor: number | null = null;
      if (imagesList.length > input.limit) {
        nextCursor = (input.cursor ?? 0) + input.limit;
        imagesList.pop(); // Remove the extra item
      }

      return {
        images: imagesList,
        nextCursor,
      };
    }),

  // Get single image
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Logic to fetch a single image by ID
      const image = await ctx.db.query.images.findFirst({
        where: eq(images.id, input.id),
        with: {
          plantImages: {
            columns: { plantId: false, imageId: false },
            with: { plant: true },
          },
        },
      });

      return image;
    }),

  // Connect image to plant
  connectToPlant: protectedProcedure
    .input(
      z.object({
        imageId: z.string(),
        plantId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.insert(plantImages).values({
        // ownerId: ctx.session.user.id as string,
        imageId: input.imageId,
        plantId: input.plantId,
      });
    }),

  // Upload image
  upload: protectedProcedure
    .input(
      z.object({
        imageUrl: z.string().url(),
        // other metadata fields can be added here
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Logic to handle image creation
      const newImage = await ctx.db.insert(images).values({
        ownerId: ctx.session.user.id as string,
        imageUrl: input.imageUrl,
        createdAt: new Date(),
      });

      return newImage;
    }),

  // Delete image
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Logic to delete an image by ID
      const deletedImage = await ctx.db
        .delete(images)
        .where(eq(images.id, input.id));
      return { success: !!deletedImage };
    }),
});
