// src/server/api/routers/image.ts:
import { eq } from "drizzle-orm";
import { z } from "zod";
import { plants } from "~/lib/db/schema";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// Import the plants schema correctly

export const plantRouter = createTRPCRouter({
  // Get paginated plants for the current user
  getUserPlants: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(9),
        cursor: z.number().nullish(), // Cursor-based pagination
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id as string; // Access the user ID from session

      // This does relly the same as Step 1 -4 above???
      const userPlantsNew = await ctx.db.query.plants.findMany({
        where: eq(plants.ownerId, userId),
        with: {
          plantImages: {
            with: {
              image: true,
            },
          },
        },
      });

      const userPlantsFlattened = await ctx.db.query.plants.findMany({
        where: eq(plants.ownerId, userId),
        columns: {
          id: true,
          name: true,
          ownerId: true,
          // headerImageId: true,
          createdAt: true,
          updatedAt: true,
        },
        with: {
          headerImage: { columns: { id: true, imageUrl: true } },
          plantImages: {
            columns: { imageId: false, plantId: false },
            with: {
              image: {
                columns: {
                  id: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      });

      // Check if there is a next page
      let nextCursor: number | null = null;
      if (userPlantsFlattened.length > input.limit) {
        nextCursor = (input.cursor ?? 0) + input.limit;
        userPlantsFlattened.pop(); // Remove the extra item
      }

      return {
        plants: userPlantsFlattened,
        nextCursor,
      };
    }),

  // Get single plant
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Logic to fetch a single image by ID
      return await ctx.db.query.plants.findFirst({
        where: eq(plants.id, input.id),
      });
    }),

  // Create a plant
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Logic to handle image creation
      const newPlant = await ctx.db.insert(plants).values({
        name: input.name,
        ownerId: ctx.session.user.id as string,
      });

      return newPlant;
    }),

  // Delete plant
  deleteById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Logic to delete an plant by ID
      const deletedImage = await ctx.db
        .delete(plants)
        .where(eq(plants.id, input.id));
      return { success: !!deletedImage };
    }),
});
